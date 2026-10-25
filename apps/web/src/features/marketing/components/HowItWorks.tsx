const steps = [
  {
    num: "01",
    title: "Create & Place Service Order",
    desc: "Choose the service you need and place your order with clear requirements, goals, and timeline. The more details you provide, the better the outcome.",
  },
  {
    num: "02",
    title: "Payment & Secure Escrow",
    desc: "Complete your payment securely. Your funds are safely held in escrow — ensuring protection for both you and the professional until the work is completed.",
  },
  {
    num: "03",
    title: "Matching & Assignment",
    desc: "Jobrio analyzes your requirements and assigns the most suitable verified professional for your task — based on skills, experience, and availability etc.",
  },
  {
    num: "04",
    title: "Start Execution & Collaborate",
    desc: "Your project begins under a structured workflow. You can directly chat with your assigned professional — share details, answer queries, and provide inputs to ensure perfect results without delays.",
  },
  {
    num: "05",
    title: "Quality Check (Q&A)",
    desc: "Once the professional submits the work, it goes through Jobrio's internal Quality Assurance (Q&A) process. If the work meets standards, it is approved for delivery. If not, it is sent back for rework to ensure the final output is accurate and high-quality.",
  },
  {
    num: "06",
    title: "Receive & Review Delivery",
    desc: "After passing quality checks, the final work is delivered to you. Review everything carefully to ensure it meets your expectations.",
  },
  {
    num: "07",
    title: "Approve or Raise Dispute",
    desc: "If satisfied, approve the work — payment is released to the professional. If not, you can request revisions or raise a dispute, and Jobrio will step in to resolve it.",
  },
];

const HowItWorks = () => {
  return (
    <section className="px-8 md:px-20 py-32 bg-surface">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-4xl font-extrabold text-on-background mb-6">
          Built for Frictionless Velocity
        </h2>
        <h3 className="text-2xl md:text-3xl font-extrabold text-primary mb-6">How It Works</h3>
        <p className="text-on-surface-variant text-lg">
          The Jobrio engine automates every step of the professional services lifecycle.
        </p>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory">
        {steps.map((step) => (
          <div
            key={step.num}
            className="min-w-[260px] max-w-[260px] relative snap-start flex-shrink-0"
          >
            <div className="text-[5rem] font-black text-surface-container-high absolute -top-8 -left-2 z-0 select-none">
              {step.num}
            </div>
            <div className="relative z-10 pt-10">
              <h3 className="text-lg font-bold text-primary mb-3">{step.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-16">
        <p className="text-xl md:text-2xl font-bold tracking-tight">
          <span className="text-primary">Every step is designed to give you</span>{" "}
          <span className="text-on-surface-variant">clarity, protection, and</span>{" "}
          <span className="text-primary">guaranteed execution.</span>
        </p>
      </div>
    </section>
  );
};

export default HowItWorks;
