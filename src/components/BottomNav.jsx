import { NavLink } from 'react-router-dom';
import { Home, LineChart, PlusCircle, Bot, User } from 'lucide-react';
import { t } from '../utils/helpers';
import useStore from '../store/useStore';

export default function BottomNav() {
  const language = useStore((s) => s.language); // forçar re-render ao trocar idioma

  const links = [
    { to: '/', icon: Home, label: t('dashboard') },
    { to: '/reports', icon: LineChart, label: t('reports') },
    { to: '/add', icon: PlusCircle, label: t('add'), special: true },
    { to: '/ai', icon: Bot, label: 'FinBot' },
    { to: '/profile', icon: User, label: t('profile') },
  ];

  return (
    <nav className="bottom-nav mobile-only-flex">
      {links.map(({ to, icon: Icon, label, special }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''} ${special ? 'special' : ''}`}
          end={to === '/'}
        >
          {({ isActive }) => (
            <>
              <div className="icon-wrapper">
                <Icon size={special ? 26 : 22} strokeWidth={isActive || special ? 2.5 : 2} />
              </div>
              {!special && <span className="nav-label">{label}</span>}
            </>
          )}
        </NavLink>
      ))}

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 400px;
          height: 72px;
          background: rgba(18, 18, 18, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 36px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 10px;
          z-index: 1000;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }
        
        .bottom-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: var(--text-secondary);
          transition: var(--transition);
          flex: 1;
        }
        
        .bottom-nav-item.active {
          color: var(--primary);
        }
        
        .icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 32px;
        }

        .bottom-nav-item.active .icon-wrapper::after {
          content: '';
          position: absolute;
          bottom: -16px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--primary);
          box-shadow: var(--shadow-glow);
        }
        
        .bottom-nav-item.special {
          transform: translateY(-20px);
        }
        .bottom-nav-item.special .icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primary);
          color: var(--text-on-primary);
          box-shadow: var(--shadow-glow-strong);
        }
        .bottom-nav-item.special:hover {
          transform: translateY(-22px);
        }
        
        .nav-label {
          font-size: 10px;
          font-weight: 600;
          display: none;
        }
      `}</style>
    </nav>
  );
}
