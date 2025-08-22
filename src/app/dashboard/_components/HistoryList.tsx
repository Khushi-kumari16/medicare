'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import AddNewSessionDialog from './AddNewSessionDialog';
import axios from 'axios';

type DoctorAgent = {
  id: number;
  name?: string;
  specialist: string;
  image?: string;
};

type MedicalReport = {
  summary: string;
  symptoms: string[];
  duration: string;
  severity: string;
  medicationsMentioned: string[];
  recommendations: string[];
};

type SessionDetail = {
  id: number;
  session_id: string;
  selectedDoctor: DoctorAgent;
   suggestedDoctors?: DoctorAgent[];
  createdOn: string;
  report: MedicalReport;
};

function HistoryList() {
  const [historyList, setHistory] = useState<SessionDetail[]>([]);
  const [showFullHistory, setShowFullHistory] = useState(false);

  useEffect(() => {
    GetHistoryList();
  }, []);

  const GetHistoryList = async () => {
    try {
      const result = await axios.get('/api/users/session-chat?sessionId=all');
      setHistory(result.data);
    } catch (error) {
      console.error("❌ Failed to load session history:", error);
    }
  };

  const getDoctorImage = (doctor: DoctorAgent) => {
    if (doctor.image && doctor.image.trim() !== '') return doctor.image;
    return `/doctor${doctor.id || 1}.png`;
  };

  const visibleHistory = showFullHistory ? historyList : historyList.slice(0, 1);

  return (
    <div className="mt-10">
      {historyList.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-7 border-bold rounded-2xl border-2">
          <Image src="/medical-assistance.png" alt="empty" width={150} height={150} />
          <h2 className="font-bold text-xl mt-5">No Recent Consultations</h2>
          <p>It looks like you haven't consulted with any doctors yet.</p>
          <AddNewSessionDialog />
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Your Medical History</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleHistory.map((session) => {
              const report = session.report;
              return (
                <div
                  key={session.session_id}
                  className="p-5 rounded-xl border bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={getDoctorImage(session.selectedDoctor)}
                      alt={session.selectedDoctor.specialist}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-lg font-semibold">
                        {session.selectedDoctor.specialist}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {new Date(session.createdOn).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {report ? (
                    <div className="text-sm text-gray-700 space-y-1 mt-2">
                      <p className="line-clamp-3">
                        <span className="font-semibold">Summary:</span> {report.summary}
                      </p>
                      <p>
                        <span className="font-semibold">Symptoms:</span> {report.symptoms.join(", ") || "None"}
                      </p>
                      <p>
                        <span className="font-semibold">Duration:</span> {report.duration}
                      </p>
                      <p>
                        <span className="font-semibold">Severity:</span> {report.severity}
                      </p>
                      <p>
                        <span className="font-semibold">Medications:</span> {report.medicationsMentioned.join(", ") || "None"}
                      </p>
                      <p>
                        <span className="font-semibold">Recommendations:</span> {report.recommendations.join(", ") || "None"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic mt-2">No report available</p>
                  )}
                </div>
              );
            })}
          </div>

          {historyList.length > 2 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowFullHistory((prev) => !prev)}
              >
                {showFullHistory ? 'Hide History' : 'See All History'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HistoryList;
