export const revalidate = 3600;

const faqs = [
  {
    question: "How does payment work?",
    answer:
      "SpareSeat does not process ride payments. Riders and drivers settle contribution directly.",
  },
  {
    question: "What is required for drivers?",
    answer:
      "Drivers must verify phone, submit a license photo path for review, and confirm auto insurance supports cost sharing.",
  },
  {
    question: "How is suggested contribution controlled?",
    answer:
      "Each route has a cost recovery cap based on route distance and a per kilometre formula.",
  },
  {
    question: "Can I report unsafe behavior?",
    answer:
      "Yes. Every listing has reporting options for no show, unsafe behavior, and fraudulent listing concerns.",
  },
];

export default function FaqPage() {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold">FAQ</h1>
      <div className="mt-5 grid gap-4">
        {faqs.map((faq) => (
          <section key={faq.question}>
            <h2 className="text-lg font-semibold">{faq.question}</h2>
            <p className="mt-1 text-slate-700">{faq.answer}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
