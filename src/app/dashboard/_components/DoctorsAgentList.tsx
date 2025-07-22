import React from 'react';
import { AIDoctorAgents } from '../../../../shared/list';
import DoctorAgentCard from './DoctorsAgentCard';

function DoctorsAgentList() {
  return (
    <div className='mt-10'>
      <h2 className='font-bold text-xl'>AI Specialist Doctor Agent</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-5'>
        {AIDoctorAgents.map((doctor, index) => (
          <div key={index}>
           <DoctorAgentCard doctor ={doctor}/>
           </div>
        ))}
      </div>
    </div>
  );
}

export default DoctorsAgentList;
