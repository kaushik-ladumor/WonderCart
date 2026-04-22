const express = require("express");
const router = express.Router();
const suspensionController = require("../Controllers/Suspension.Controller");
const Authorization = require("../Middlewares/Auth");
const authorizationRole = require("../Middlewares/authorizeRoles");
const requireVerification = require("../Middlewares/RequireVerification");

// -- Admin Managed Suspension Routes --

router.post("/issue-warning",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    suspensionController.issueWarning
);

router.post("/suspend",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    suspensionController.suspendSeller
);

router.post("/resolve",
    Authorization,
    authorizationRole('admin'),
    requireVerification,
    suspensionController.resolveSuspension
);

// -- Case Fetching (for UI) --
// router.get("/cases", Authorization, authorizationRole('admin'), suspensionController.getCases);
// router.get("/case/:caseId", Authorization, authorizationRole('admin'), suspensionController.getCaseByOrderId);

module.exports = router;
