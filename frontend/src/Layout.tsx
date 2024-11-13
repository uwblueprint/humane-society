import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './components/common/navbar/NavBar';
import PAGE_NAMES from './constants/PageNames';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const getPageName = () => {
    switch (location.pathname) {
      case '/':
        return PAGE_NAMES.HOME;
      case '/login':
        return PAGE_NAMES.LOGIN;
      case '/signup':
        return PAGE_NAMES.SIGNUP;
      case '/edit-team':
        return PAGE_NAMES.EDIT_TEAM;
      case '/entity':
        return PAGE_NAMES.DISPLAY_ENTITY;
      case '/entity/create':
        return PAGE_NAMES.CREATE_ENTITY;
      case '/entity/update':
        return PAGE_NAMES.UPDATE_ENTITY;
      case '/simpleEntity':
        return PAGE_NAMES.DISPLAY_SIMPLE_ENTITY;
      case '/simpleEntity/create':
        return PAGE_NAMES.CREATE_SIMPLE_ENTITY;
      case '/simpleEntity/update':
        return PAGE_NAMES.UPDATE_SIMPLE_ENTITY;
      case '/hooks':
        return PAGE_NAMES.HOOKS;
      case '/notifications':
        return PAGE_NAMES.NOTIFICATIONS;
      case '/profile':
        return PAGE_NAMES.PROFILE;
      case '/dev-utility':
        return PAGE_NAMES.DEV_UTILITY;
      case '/admin/users':
        return PAGE_NAMES.USER_MANAGEMENT;
      case '/admin':
        return PAGE_NAMES.ADMIN;
      default:
        return 'Page';
    }
  };

  return (
    <div>
      <NavBar pageName={getPageName()} />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;