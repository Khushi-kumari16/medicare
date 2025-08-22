
 import React from 'react';
import Image from 'next/image';
import { IconArrowRight } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import AppHeader from './AppHeader';

export type DoctorAgent = {
  id: number;
  specialist: string;
  description: string;
  image: string;
  agentPrompt: string;
  voiceId?:string
};

type Props = {
  doctor: DoctorAgent;
};

function DoctorAgentCard({doctor }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between h-[370px] 
                    transition-transform hover:scale-[1.02] hover:shadow-lg cursor-pointer">
      <div className="flex flex-col items-center text-center">
        {/* Image wrapper to enforce consistent sizing */}
        <div className="w-[150px] h-[150px] relative mb-4">
          <Image
  src={doctor.image.startsWith('/') ? doctor.image : `/images/${doctor.image}`}
  alt={doctor.specialist}
  fill
  sizes="150px"
  className="object-cover rounded-md"
/>

        </div>
        <h3 className="text-lg font-semibold">{doctor.specialist}</h3>
        <p className="text-sm text-gray-500 mt-2">{doctor.description}</p>
      </div>

      {/* Button */}
      <Button className="w-full mt-2 flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-700 transition rounded-md">
        Start Consultation
        <IconArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default DoctorAgentCard;