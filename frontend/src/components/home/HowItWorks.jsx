const STEPS = [
  ['📸', 'List your waste', 'Choose categories and approximate weight. See an instant value estimate.'],
  ['📍', 'Get matched', 'Verified recyclers, NGOs and scrap collectors near you can accept.'],
  ['🗓️', 'Schedule pickup', 'Pick a time that suits you. Reschedule anytime before pickup.'],
  ['⚖️', 'Weight verified', 'The collector weighs it on-site and confirms the final value.'],
  ['💰', 'Get rewarded', 'Earnings are credited to your wallet and added to your Waste Passport.'],
];

function HowItWorksStep({ icon, title, description, number }) {
  return (
    <article className="card">
      <div className="big" aria-hidden="true">{icon}</div>
      <strong>{number}. {title}</strong>
      <p className="muted small">{description}</p>
    </article>
  );
}

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading">
      <h2 id="how-it-works-heading">How it works</h2>
      <div className="grid grid-5">
        {STEPS.map(([icon, title, description], index) => (
          <HowItWorksStep key={title} icon={icon} title={title} description={description} number={index + 1} />
        ))}
      </div>
    </section>
  );
}
