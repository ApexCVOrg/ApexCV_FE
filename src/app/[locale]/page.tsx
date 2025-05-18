import Link from 'next/link';
import { ROUTES } from '@/lib/constants/constants';
import { useTranslations } from 'next-intl';
import { Link as I18nLink } from '@/i18n/navigation';

export default function Home() {
  const t = useTranslations(); // Uses the default namespace or root if not specified

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <div className="hero-actions">
            <I18nLink href={ROUTES.REGISTER} className="btn btn-primary">
              {t('hero.getStarted')}
            </I18nLink>
            <I18nLink href="/templates" className="btn btn-secondary">
              {t('hero.viewTemplates')}
            </I18nLink>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>{t('features.title')}</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>{t('features.templates.title')}</h3>
            <p>{t('features.templates.description')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('features.easyUse.title')}</h3>
            <p>{t('features.easyUse.description')}</p>
          </div>
          <div className="feature-card">
            <h3>{t('features.export.title')}</h3>
            <p>{t('features.export.description')}</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>{t('howItWorks.title')}</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>{t('howItWorks.step1.title')}</h3>
            <p>{t('howItWorks.step1.description')}</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>{t('howItWorks.step2.title')}</h3>
            <p>{t('howItWorks.step2.description')}</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>{t('howItWorks.step3.title')}</h3>
            <p>{t('howItWorks.step3.description')}</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>{t('cta.title')}</h2>
        <p>{t('cta.subtitle')}</p>
        <I18nLink href={ROUTES.REGISTER} className="btn btn-primary">
          {t('cta.button')}
        </I18nLink>
      </section>
    </div>
  );
}