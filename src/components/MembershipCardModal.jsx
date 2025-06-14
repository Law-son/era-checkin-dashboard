import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import MembershipCard from './MembershipCard';

const MembershipCardModal = ({ member, onClose, onIssueCard, isIssuing }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Membership Card</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Click the button below to download the membership card for {member.fullName}.
          </p>
          <MembershipCard 
            member={member} 
            onIssueCard={onIssueCard}
            isIssuing={isIssuing}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default MembershipCardModal; 