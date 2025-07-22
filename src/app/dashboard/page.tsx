 "use client";

 import React from 'react';
import HistoryList from '@/app/dashboard/_components/HistoryList';

import { Button } from '@/components/ui/button';
import DoctorsAgentList from './_components/DoctorsAgentList';
import AddNewSessionDialog from './_components/AddNewSessionDialog';

function Dashboard() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-2xl">My Dashboard</h2>
        <AddNewSessionDialog/>
      </div>

      <HistoryList />
      <DoctorsAgentList />
    </div>
  );
}

export default Dashboard;
