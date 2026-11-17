import {
  DocumentTextIcon,
  EyeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const reasons = [
  {
    title: "روایت‌های دست‌اول و جستارهای اصیل",
    description: "از تجربه‌های واقعی و نگاه نویسندگان فارسی‌زبان بخوانید؛ بی‌واسطه، دقیق و دور از حرف‌های تکراری.",
    Icon: DocumentTextIcon,
  },
  {
    title: "فضایی برای مکث و دیدنِ عمیق‌تر",
    description: "میان شتاب روزمره فرصتی برای فکر کردن، کشف جزئیات و همراه شدن با روایت‌های ماندگار پیدا کنید.",
    Icon: EyeIcon,
  },
  {
    title: "همراهی نویسندگان و خوانندگان",
    description: "در جامعه‌ای اهل نوشتن و خواندن، تجربه‌ها و دیدگاه‌های تازه را با دیگران به اشتراک بگذارید.",
    Icon: UserGroupIcon,
  },
  {
    title: "توجه به اصالت قلم و محتوای غنی",
    description: "مطلب‌هایی را دنبال کنید که با دقت نوشته شده‌اند و برای وقت و توجه شما ارزش قائل‌اند.",
    Icon: ShieldCheckIcon,
  },
];

export default function WhyChoose() {
  return (
    <section className="home-why-choose" aria-labelledby="home-why-title">
      <div className="home-why-heading">
        <span className="home-why-badge"><SparklesIcon aria-hidden="true" />چرا خط و کاغذ؟</span>
        <h2 id="home-why-title">برای خواندنی که در ذهن می‌ماند</h2>
      </div>
      <ul className="home-why-list">
        {reasons.map(({ title, description, Icon }) => (
          <li className="home-why-item" key={title}>
            <span className="home-why-icon" aria-hidden="true"><Icon /></span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
