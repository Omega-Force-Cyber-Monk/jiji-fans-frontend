import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "antd";
import { ReactNode } from "react";
type TGlobalModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  onClose?: () => void;
  closeIcon?: boolean;
  children: ReactNode;
  maxWidth?: string;
};

const GlobalModal = ({
  isModalOpen,
  setIsModalOpen,
  onClose,
  closeIcon,
  children,
  maxWidth,
}: TGlobalModalProps) => {
  const handleCancel = () => {
    if (onClose) onClose();
    setIsModalOpen(false);
  };

  return (
    <Modal
      centered
      title={null}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      closeIcon={false}
      width={"100%"}
      style={{
        maxWidth: maxWidth || "544px", // Apply dynamic maxWidth, default to 844px
      }}
    >
      {closeIcon !== false && (
        <button
          onClick={handleCancel}
          className="absolute top-4 right-8 text-red-500 shadow-inner bg-gray-100/30 rounded-full p-0.5 z-10 cursor-pointer"
        >
          <XMarkIcon className="w-6" />
        </button>
      )}
      {children}
    </Modal>
  );
};

export default GlobalModal;
