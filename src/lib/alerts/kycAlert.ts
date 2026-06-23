import Swal from "sweetalert2";

export const kycAlert = ({
  func,
  denyFunc,
}: {
  func: () => void;
  denyFunc?: () => void;
}) => {
  Swal.fire({
    title: "Complete Your KYC Verification",
    icon: undefined,
    html: `
      <div style="padding: 8px 0;">
        <div style="
          width: 64px;
          height: 64px;
          background: #fff7ed;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#f97316" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <p style="
          color: #374151;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 16px;
          text-align: center;
        ">
          You are now a <strong>Creator</strong>.<br/>
          You have access to all creator features, but to enable <strong>withdrawals</strong> you must complete your KYC / KYB verification.
        </p>

        <div style="
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          text-align: left;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f97316" stroke-width="2" style="flex-shrink:0;margin-top:2px">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span style="font-size: 12px; color: #c2410c; line-height: 1.5;">
            Verification is reviewed within <strong>1–3 business days</strong>. You'll be notified by email once approved.
          </span>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Verify Now →",
    cancelButtonText: "Later",
    showConfirmButton: true,
    reverseButtons: true,
    buttonsStyling: false,
    customClass: {
      popup: "!rounded-2xl !shadow-xl",
      title: "!text-gray-800 !text-lg !font-semibold !pt-6",
      htmlContainer: "!px-6",
      actions: "!gap-3 !pb-6 !pt-2",
      confirmButton:
        "!bg-orange-500 hover:!bg-orange-600 !text-white !font-semibold !py-2.5 !px-5 !rounded-full !text-sm !transition-all",
      cancelButton:
        "!bg-gray-100 hover:!bg-gray-200 !text-gray-600 !font-semibold !py-2.5 !px-12 !rounded-full !text-sm !transition-all",
    },
  }).then((res) => {
    if (res.isConfirmed) {
      func();
    } else {
      denyFunc();
    }
  });
};
