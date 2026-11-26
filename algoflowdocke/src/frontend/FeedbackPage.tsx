import React, { useState } from "react";
import { Header } from "@/frontend/components/Header";
import { Footer } from "@/frontend/components/Footer";
import { MessageSquarePlus, Star, Send, ThumbsUp, CheckCircle2, Sparkles, MessageCircle, Heart } from "lucide-react";
import { toast } from "sonner";

export const FeedbackPage: React.FC = () => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>("general");
  const [subject, setSubject] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments.trim()) {
      toast.error("Please enter your feedback comments.");
      return;
    }

    setIsSubmitted(true);
    toast.success("Thank you for your feedback! Your review helps us improve.");
  };

  const sampleReviews = [
    {
      name: "Sujan Sharma",
      role: "Verified Buyer",
      rating: 5,
      comment: "The 360° product rotation view is absolutely mind blowing! Helped me inspect every detail of the laptop before ordering.",
      date: "2 days ago",
      helpful: 14
    },
    {
      name: "Aashish Shrestha",
      role: "Customer",
      rating: 5,
      comment: "Super smooth checkout and instant tracking updates. Very impressed by the AI requirement finder tool!",
      date: "1 week ago",
      helpful: 28
    },
    {
      name: "Pooja Gurung",
      role: "Verified Buyer",
      rating: 4,
      comment: "Great customer service response time. The EMI application process was hassle-free with my NIC Asia credit card.",
      date: "2 weeks ago",
      helpful: 9
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12">
        <div className="neo-container space-y-12">
          {/* Header Banner */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
              <MessageSquarePlus size={14} /> We Value Your Voice
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Customer <span className="text-primary">Feedback</span> & Reviews
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Your experience matters. Tell us what you loved or how we can make your tech shopping experience even better.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Feedback Form */}
            <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Feedback Submitted!</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you for sharing your thoughts with us. We review all feedback carefully to continuously upgrade our service.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setIsSubmitted(false); setComments(""); setSubject(""); }}
                    className="px-6 py-2.5 rounded-xl bg-accent text-foreground text-xs font-bold hover:bg-accent/80 transition-colors"
                  >
                    Submit Another Response
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Rating selector */}
                  <div className="space-y-2 text-center sm:text-left">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Overall Rating
                    </label>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            size={32}
                            className={`transition-colors ${
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-bold font-mono text-primary">
                        {rating} / 5
                      </span>
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Feedback Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-accent border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="general">General Experience</option>
                      <option value="product">Product Quality & 3D Viewer</option>
                      <option value="delivery">Delivery & Order Fulfillment</option>
                      <option value="service">Service Center & Warranty</option>
                      <option value="bug">Website Bug / Feature Request</option>
                    </select>
                  </div>

                  {/* Subject Line */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Subject Title
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Great 360 viewer experience!"
                      className="w-full h-11 px-4 rounded-xl bg-accent border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Comments */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Detailed Comments *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Share your detailed feedback or suggestions here..."
                      className="w-full p-4 rounded-2xl bg-accent border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={16} />
                    <span>Submit Feedback</span>
                  </button>
                </form>
              )}
            </div>

            {/* Community Reviews Feed */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">Recent Customer Reviews</h3>
                <span className="text-xs font-bold text-primary">4.9 / 5.0 Rating</span>
              </div>

              <div className="space-y-4">
                {sampleReviews.map((rev, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-card border border-border space-y-3 shadow-sm hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{rev.name}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono">{rev.role} • {rev.date}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
                        <ThumbsUp size={12} /> Helpful ({rev.helpful})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeedbackPage;
