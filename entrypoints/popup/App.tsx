import { useState } from 'react';
import Sidebar from '~/components/popup/Sidebar';
import HomePage from '~/components/popup/HomePage';
import QuickDMPage from '~/components/popup/QuickDMPage';
import ListsPage from '~/components/popup/ListsPage';
import TemplatesPage from '~/components/popup/TemplatesPage';
import LogsPage from '~/components/popup/LogsPage';
import SettingsPage from '~/components/popup/SettingsPage';
import type { Page } from '~/components/popup/Sidebar';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div
      style={{
        display: 'flex',
        width: '800px',
        height: '600px',
        backgroundColor: 'white',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
        {currentPage === 'quick-dm' && <QuickDMPage onNavigate={setCurrentPage} />}
        {currentPage === 'lists' && <ListsPage />}
        {currentPage === 'templates' && <TemplatesPage />}
        {currentPage === 'logs' && <LogsPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}
