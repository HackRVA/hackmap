export function ensureFontAwesomeLoaded() {
	if (!document.querySelector('link[href*="font-awesome"]')) {
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css";
		link.integrity = "sha512-5Hs3dF2AEPkpNAR7UiOHba+lRSJNeM2ECkwxUIxC1Q/FLycGTbNapWXB4tP889k5T5Ju8fs4b1P5z/iB4nMfSQ==";
		link.crossOrigin = "anonymous";
		link.referrerPolicy = "no-referrer";
		document.head.appendChild(link);
	}
}
