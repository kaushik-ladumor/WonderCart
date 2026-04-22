const User = require("../Models/User.Model");
const SuspensionCase = require("../Models/SuspensionCase.Model");
const SubOrder = require("../Models/SubOrder.Model");
const MasterOrder = require("../Models/MasterOrder.Model");
const Product = require("../Models/Product.Model");
const Notification = require("../Models/Notification.Model");
const mongoose = require("mongoose");

const generateCaseId = async () => {
    const year = new Date().getFullYear();
    const count = await SuspensionCase.countDocuments();
    return `SUSP-${year}-${(count + 1).toString().padStart(5, '0')}`;
};

// -- Template Simulation --
const sendTemplateEmail = async (templateId, recipient, data) => {
    console.log(`[EMAIL SENT] Template: ${templateId} to ${recipient}`);
    console.log(`[DATA]:`, data);
    
    // Also create a system notification
    await Notification.create({
        user: data.userId,
        message: `System Alert: ${templateId} - ${data.subject || 'Action required on your account'}`,
        type: 'system',
        meta: { caseId: data.caseId, orderId: data.orderId }
    });
};

const issueWarning = async (req, res) => {
    try {
        const { sellerId, reason, orderId, complaintId } = req.body;
        const seller = await User.findById(sellerId);
        
        if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

        seller.warningCount += 1;
        const caseId = await generateCaseId();
        
        seller.warningHistory.push({
            caseId,
            reason,
            issuedBy: req.user.userId,
            issuedAt: Date.now()
        });

        await seller.save();

        // Template 2 — SELLER FORMAL WARNING
        await sendTemplateEmail("T2_SELLER_WARNING", seller.email, {
            userId: seller._id,
            caseId,
            complaintId,
            orderId,
            warningNum: seller.warningCount,
            subject: "Warning: Action required on your seller account"
        });

        if (seller.warningCount >= 3) {
            return res.status(200).json({ 
                success: true, 
                message: "Warning issued. Threshold reached! Auto-suspension recommended.",
                thresholdReached: true 
            });
        }

        res.status(200).json({ success: true, message: "Warning issued successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const suspendSeller = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { sellerId, reasonCode, description, complaintIds } = req.body;
        const seller = await User.findById(sellerId).session(session);

        if (!seller) throw new Error("Seller not found");
        if (seller.isSuspended) throw new Error("Seller is already suspended");

        const caseId = await generateCaseId();
        const appealDeadline = new Date();
        appealDeadline.setDate(appealDeadline.getDate() + 7);

        // Calculate frozen balance (pending payouts)
        const pendingSubOrders = await SubOrder.find({ 
            seller: sellerId, 
            payoutStatus: "pending",
            status: { $ne: "cancelled" }
        }).session(session);
        
        const frozenBalance = pendingSubOrders.reduce((acc, curr) => acc + (curr.sellerPayout || 0), 0);

        const suspensionCase = new SuspensionCase({
            caseId,
            seller: sellerId,
            reasonCode,
            description,
            admin: req.user.userId,
            complaintIds,
            appealDeadline,
            frozenBalance
        });

        await suspensionCase.save({ session });

        seller.isSuspended = true;
        seller.activeSuspensionCase = suspensionCase._id;
        await seller.save({ session });

        // Hide listings
        await Product.updateMany({ owner: sellerId }, { $set: { isVisible: false } }).session(session);

        // Handle Active Orders (Part 3)
        const activeSubOrders = await SubOrder.find({
            seller: sellerId,
            status: { $in: ["placed", "confirmed", "processing", "shipped", "on_hold"] }
        }).populate("masterOrder").session(session);

        for (const sub of activeSubOrders) {
            if (["placed", "confirmed", "processing"].includes(sub.status)) {
                // STATUS A: Pending/Processing -> HOLD
                sub.status = "on_hold";
                sub.statusHistory.push({ from: sub.status, to: "on_hold", reason: `Seller suspension ${caseId}` });
                await sub.save({ session });
                
                // Update Master Order Status
                const master = await MasterOrder.findById(sub.masterOrder._id).session(session);
                master.status = await master.computeStatus();
                await master.save({ session });

                // Template 4 — BUYER: ORDER ON HOLD
                await sendTemplateEmail("T4_BUYER_ORDER_HOLD", sub.masterOrder.user.email, {
                    userId: sub.masterOrder.user._id,
                    orderId: sub.masterOrder.orderId,
                    caseId
                });
            } else if (sub.status === "shipped") {
                // STATUS B: In Transit -> Notify
                await sendTemplateEmail("T6_BUYER_IN_TRANSIT_NOTICE", sub.masterOrder.user.email, {
                    userId: sub.masterOrder.user._id,
                    orderId: sub.masterOrder.orderId,
                    caseId
                });
            }
        }

        // Template 3 — SELLER SUSPENSION NOTICE
        await sendTemplateEmail("T3_SELLER_SUSPENSION_NOTICE", seller.email, {
            userId: seller._id,
            caseId,
            frozenAmount: frozenBalance
        });

        await session.commitTransaction();
        res.status(200).json({ success: true, caseId, message: "Seller suspended and actions initiated" });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

const resolveSuspension = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { caseId, outcome, notes } = req.body;
        const suspensionCase = await SuspensionCase.findOne({ caseId }).populate("seller").session(session);

        if (!suspensionCase) throw new Error("Case not found");
        if (suspensionCase.status !== "ACTIVE") throw new Error("Case is already resolved");

        const seller = suspensionCase.seller;

        if (outcome === "REINSTATE") {
            suspensionCase.status = "RESOLVED_REINSTATED";
            seller.isSuspended = false;
            seller.activeSuspensionCase = null;
            
            // Show products again
            await Product.updateMany({ owner: seller._id }, { $set: { isVisible: true } }).session(session);

            // Template 9A — SELLER: APPEAL APPROVED
            await sendTemplateEmail("T9A_SELLER_REINSTATED", seller.email, {
                userId: seller._id,
                caseId
            });

            // Template 10 — PAYOUT RELEASE
            await sendTemplateEmail("T10_SELLER_PAYOUT_RELEASED", seller.email, {
                userId: seller._id,
                caseId,
                finalAmount: suspensionCase.frozenBalance - suspensionCase.deductionLedger.reduce((a, b) => a + b.amount, 0)
            });

        } else if (outcome === "BAN") {
            suspensionCase.status = "RESOLVED_PERMANENT_BAN";
            seller.isBanned = true;
            seller.isSuspended = false; // Transition to permanent ban
            
            // Delete products permanently or keep for audit? Prompt says "Permanently remove all seller listings"
            await Product.deleteMany({ owner: seller._id }).session(session);

            // Template 9B — SELLER: PERMANENT BAN
            await sendTemplateEmail("T9B_SELLER_BANNED", seller.email, {
                userId: seller._id,
                caseId
            });
        }

        suspensionCase.notes.push({ admin: req.user.userId, text: notes });
        await suspensionCase.save({ session });
        await seller.save({ session });

        await session.commitTransaction();
        res.status(200).json({ success: true, message: `Suspension resolved as ${outcome}` });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = {
    issueWarning,
    suspendSeller,
    resolveSuspension
};
