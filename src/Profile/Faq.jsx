import { useState } from "react";
import { ChevronIcon } from "./ProfileIcons";
import { useLanguage } from "../hooks/useLanguage";

const QUESTIONS = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
];

const Faq = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <h1>{t("faq.title")}</h1>
      </div>

      <div className="faq-list">
        {QUESTIONS.map((item, i) => (
          <div className="profile-accordion" key={item.q}>
            <button
              type="button"
              className="profile-accordion-head"
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              aria-expanded={openIndex === i}
            >
              {t(item.q)}
              <span className={openIndex === i ? "rotated" : undefined}><ChevronIcon /></span>
            </button>
            {openIndex === i && <p className="profile-accordion-body">{t(item.a)}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;
