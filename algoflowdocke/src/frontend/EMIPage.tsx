import React, { useState } from "react";
import { Header } from "@/frontend/components/Header";
import { Footer } from "@/frontend/components/Footer";
import { Calculator, CreditCard, CheckCircle2, Building2, HelpCircle, ShieldCheck, ArrowRight, Sparkles, Percent } from "lucide-react";
import { toast } from "sonner";

export const EMIPage: React.FC = () => {
  const [productPrice, setProductPrice] = useState<number>(100000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [interestRate, setInterestRate] = useState<number>(0); // 0% EMI default

  // EMI Math
  const downPayment = Math.round((productPrice * downPaymentPercent) / 100);
  const loanAmount = Math.max(0, productPrice - downPayment);
  
  // Monthly Interest Rate (r) = Annual Rate / 12 / 100
  const monthlyRate = interestRate > 0 ? interestRate / 12 / 100 : 0;
  
  const monthlyInstallment = monthlyRate > 0
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1))
    : Math.round(loanAmount / tenureMonths);

  const totalPayable = downPayment + (monthlyInstallment * tenureMonths);
  const totalInterest = Math.max(0, totalPayable - productPrice);

  const handleApplyEMI = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("EMI Eligibility Application Submitted! Our financial partner will contact you shortly.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-12">
        <div className="neo-container space-y-12">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-primary/5 to-background border border-primary/20 p-8 sm:p-12">
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                <Percent size={14} /> 0% Interest Available
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                Easy Monthly Installments <span className="text-primary">(EMI)</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Shop your favorite tech gadgets and appliances with flexible monthly payment plans. Enjoy 0% interest on select credit cards.
              </p>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none pr-12 hidden lg:block">
              <CreditCard size={320} className="text-primary" />
            </div>
          </div>

          {/* EMI Calculator & Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Calculator Card */}
            <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <Calculator size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">EMI Calculator</h2>
                  <p className="text-xs text-muted-foreground">Estimate your monthly installments instantly</p>
                </div>
              </div>

              {/* Product Price Input */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <label className="text-muted-foreground">Product Price (NPR)</label>
                  <span className="text-primary font-mono text-base font-bold">
                    Rs. {productPrice.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={500000}
                  step={5000}
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
                  <span>Rs. 10,000</span>
                  <span>Rs. 500,000</span>
                </div>
              </div>

              {/* Down Payment % Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <label className="text-muted-foreground">Down Payment ({downPaymentPercent}%)</label>
                  <span className="text-foreground font-mono text-sm font-bold">
                    Rs. {downPayment.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={5}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-2 bg-accent rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Tenure Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground">Select Tenure (Months)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[3, 6, 12, 18, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMonths(m)}
                      className={`py-3 rounded-2xl font-bold text-xs transition-all ${
                        tenureMonths === m
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                          : "bg-accent text-muted-foreground hover:text-foreground hover:bg-accent/80"
                      }`}
                    >
                      {m} Months
                    </button>
                  ))}
                </div>
              </div>

              {/* Interest Rate Option */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-muted-foreground">Interest Rate Scheme</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInterestRate(0)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      interestRate === 0
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <div className="font-bold text-sm">0% Interest Plan</div>
                    <div className="text-[11px] opacity-80">Partner bank credit cards</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterestRate(12)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      interestRate === 12
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-accent/40 text-muted-foreground"
                    }`}
                  >
                    <div className="font-bold text-sm">Standard Financing (12%)</div>
                    <div className="text-[11px] opacity-80">Direct store loan application</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Breakdown & Application Box */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-foreground pb-3 border-b border-border">
                  Payment Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Monthly Installment</span>
                    <span className="text-2xl font-black font-mono text-primary">
                      Rs. {monthlyInstallment.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/mo</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-accent/50 space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Loan Amount</span>
                      <span>Rs. {loanAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Down Payment</span>
                      <span>Rs. {downPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Interest Charges</span>
                      <span>Rs. {totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between font-bold text-foreground text-sm">
                      <span>Total Amount Payable</span>
                      <span>Rs. {totalPayable.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleApplyEMI} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prabin Khadka"
                      className="w-full h-11 px-4 rounded-xl bg-accent border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+977 98XXXXXXXX"
                      className="w-full h-11 px-4 rounded-xl bg-accent border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Check EMI Eligibility</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70 pt-4 border-t border-border">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                <span>Instant approval for partner credit card holders with zero documentation fee.</span>
              </div>
            </div>
          </div>

          {/* Partner Banks */}
          <div className="space-y-6 py-6 border-t border-border">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-foreground">Partner Financial Institutions</h3>
              <p className="text-xs text-muted-foreground">Available on credit cards issued by our partner banks</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {["Nabil Bank", "NIC Asia Bank", "Global IME Bank", "Himalayan Bank", "Standard Chartered"].map((bank, i) => (
                <div key={i} className="p-4 rounded-2xl bg-card border border-border text-center space-y-2 hover:border-primary/40 transition-colors">
                  <Building2 size={24} className="mx-auto text-primary" />
                  <p className="text-xs font-bold text-foreground">{bank}</p>
                  <p className="text-[10px] text-emerald-500 font-mono font-semibold">0% EMI Enabled</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EMIPage;
