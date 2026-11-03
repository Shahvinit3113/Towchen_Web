import Swal, { SweetAlertOptions, SweetAlertIcon } from "sweetalert2";

// Sleek auto-dismissing Toast notification
export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  showCloseButton: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  customClass: {
    popup: "swal2-toast",
    title: "!text-xs !font-bold !text-slate-800",
  },
});

export const showToast = (
  icon: SweetAlertIcon,
  title: string,
  options?: SweetAlertOptions
) => {
  return Toast.fire({
    icon,
    title,
    ...options,
  });
};

// Modal alert for Pending Inspection
export const showPendingInspectionModal = (orderNumber?: string) => {
  return Swal.fire({
    icon: "info",
    title: "Order Created",
    html: `
      <div class="space-y-3 pt-1 text-center">
        <div class="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-1.5 mx-auto">
          <span class="text-[10px] sm:text-xs uppercase font-bold text-slate-500 tracking-wider">Order No</span>
          <span class="font-mono font-extrabold text-xs sm:text-sm text-slate-900">${orderNumber || "N/A"}</span>
        </div>
        <div class="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 text-center">
          <p class="text-xs sm:text-sm font-bold text-amber-950 leading-snug">
            Pending Vehicle Inspection
          </p>
          <p class="text-[11px] sm:text-xs text-amber-700 mt-1 leading-relaxed">
            Inspection photos were skipped. Photos can be uploaded anytime by the customer or dealer to activate coverage.
          </p>
        </div>
      </div>
    `,
    confirmButtonText: "View History",
    showCancelButton: true,
    cancelButtonText: "Done",
    confirmButtonColor: "#003EF9",
    cancelButtonColor: "#f1f5f9",
    reverseButtons: true,
  });
};

// Modal alert for Activated Package
export const showOrderActiveModal = (
  orderNumber?: string,
  pdfUrl?: string | null
) => {
  return Swal.fire({
    icon: "success",
    title: "Package Activated!",
    html: `
      <div class="space-y-3 pt-1 text-center">
        <div class="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-1.5 mx-auto">
          <span class="text-[10px] sm:text-xs uppercase font-bold text-emerald-700 tracking-wider">Order No</span>
          <span class="font-mono font-extrabold text-xs sm:text-sm text-emerald-900">${orderNumber || "N/A"}</span>
        </div>
        <div class="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 text-center">
          <p class="text-xs sm:text-sm font-bold text-emerald-950 leading-snug">
            All 5 inspection photos verified!
          </p>
          <p class="text-[11px] sm:text-xs text-emerald-700 mt-1 leading-relaxed">
            Coverage is active immediately. ${
              pdfUrl
                ? "Your official warranty certificate PDF is ready for download."
                : ""
            }
          </p>
        </div>
      </div>
    `,
    confirmButtonText: pdfUrl ? "Download PDF" : "View History",
    showCancelButton: true,
    cancelButtonText: "Done",
    confirmButtonColor: "#003EF9",
    cancelButtonColor: "#f1f5f9",
    reverseButtons: true,
  });
};

// Modal alert for Error
export const showOrderErrorModal = (message: string) => {
  return Swal.fire({
    icon: "error",
    title: "Action Failed",
    text: message,
    confirmButtonText: "Close",
    confirmButtonColor: "#003EF9",
  });
};

export default Swal;
