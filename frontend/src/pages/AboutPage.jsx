// src/pages/AboutPage.jsx
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Shield,
  Truck,
  Clock,
  Award,
  Heart,
  Target,
  Users,
  Star,
  Package,
  IndianRupee,
  Leaf,
  HeadphonesIcon,
} from "lucide-react";

function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Story
          </h1>
          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            From a small idea to a brand trusted by thousands — here's how we
            started and where we're going.
          </p>
        </div>
      </div>

      {/* DETAILED STORY */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-sm max-w-none text-gray-600">
          {/* HOW IT STARTED */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs">1</span>
              </span>
              How it started
            </h2>
            <p className="mb-4">
              It was 2022. We were tired of overpriced products that looked good
              but fell apart in months. Every time we shopped online, we faced
              the same problem — either pay a premium for big brands or
              compromise on quality with cheaper alternatives.
            </p>
            <p className="mb-4">
              So we decided to build something different. A brand that doesn't
              charge you extra just for the name on the label. A brand that
              focuses on what actually matters: quality materials, thoughtful
              design, and fair prices.
            </p>
            <p>
              We started with just 5 products — a white t-shirt, a black hoodie,
              a tote bag, a water bottle, and a phone case. We tested everything
              ourselves. We wore them, used them, washed them, and only when we
              were 100% satisfied, we put them on the website.
            </p>
          </div>

          {/* GROWTH */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs">2</span>
              </span>
              The journey so far
            </h2>
            <p className="mb-4">
              Word spread fast. What started as a small Instagram page with 200
              followers grew into a community of over 50,000 customers across
              India. Not through expensive ads or influencer campaigns — but
              through honest reviews and word of mouth.
            </p>
            <p className="mb-4">
              Today, we offer 50+ products across apparel, accessories, and home
              essentials. But our process remains the same. We don't launch
              products just to fill the catalog. Every item goes through months
              of sampling, testing, and refining.
            </p>
            <p>
              We've shipped over 25,000 orders. We've handled returns,
              exchanges, and countless customer emails. And through it all,
              we've learned one thing: people don't want cheap products. They
              want fair products. Products that deliver on their promise.
            </p>
          </div>

          {/* TODAY */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs">3</span>
              </span>
              Where we are today
            </h2>
            <p className="mb-4">
              We're now a team of 12 people — designers, quality analysts,
              customer support specialists, and packaging experts. We're based
              in Mumbai, but our customers are everywhere: from metro cities to
              small towns across India.
            </p>
            <p className="mb-4">
              We still pack and ship most orders ourselves. We still read every
              customer review. We still personally test every new product before
              it launches. Because that's what we promised ourselves when we
              started — stay small enough to care, grow enough to reach.
            </p>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="bg-gray-50 py-12 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            By the numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                50+
              </div>
              <div className="text-sm text-gray-600">Premium products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                25K+
              </div>
              <div className="text-sm text-gray-600">Orders shipped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                50K+
              </div>
              <div className="text-sm text-gray-600">Happy customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                4.8
              </div>
              <div className="text-sm text-gray-600">Average rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT MAKES US DIFFERENT */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            What makes us different
          </h2>
          <p className="text-gray-600 text-sm max-w-xl mx-auto">
            Not just features. Real differences you'll notice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg border border-gray-100">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No middlemen</h3>
            <p className="text-sm text-gray-600">
              We work directly with manufacturers. No distributors, no
              wholesalers. Just fair prices, always.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Responsible packaging
            </h3>
            <p className="text-sm text-gray-600">
              100% plastic-free shipping. Our boxes are recycled, our tape is
              paper, and our inserts are compostable.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mb-4">
              <HeadphonesIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Human support</h3>
            <p className="text-sm text-gray-600">
              No chatbots. No automated responses. Real humans, real replies,
              usually within 2 hours.
            </p>
          </div>
        </div>
      </div>

      {/* OUR PROMISE */}
      <div className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Heart className="w-8 h-8 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-bold mb-4">Our promise to you</h2>
          <p className="text-gray-300 text-sm mb-6 max-w-xl mx-auto">
            If you're not happy, we're not happy. Every product comes with a
            2-year warranty and 30-day easy returns. No questions asked. No
            hidden terms.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded font-medium hover:bg-gray-100 transition w-full sm:w-auto">
                Shop with confidence
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
            <Link to="/contact">
              <button className="inline-flex items-center gap-2 border border-white/30 text-white px-6 py-3 rounded font-medium hover:bg-white/10 transition w-full sm:w-auto">
                Contact us
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ TEASER */}
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Still have questions?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          We've got answers. Check our FAQ or reach out directly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/faq"
            className="text-sm font-medium text-black underline underline-offset-4 hover:no-underline"
          >
            View FAQ
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            to="/contact"
            className="text-sm font-medium text-black underline underline-offset-4 hover:no-underline"
          >
            Email us
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
