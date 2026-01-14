// eKYC Application - Main JavaScript File
class EKYCApp {
    constructor() {
        this.currentLanguage = 'vi';
        this.currentStep = 1;
        this.maxSteps = 4;
        this.currentDocType = null;
        this.capturedImages = [];
        this.faceDetectionActive = false;
        this.cameraStream = null;
       
        // Language translations
        this.translations = {
            vi: {
                mainTitle: 'Xác thực giấy tờ',
                mainSubtitle: 'Chọn giấy tờ bạn muốn xác thực',
                idCardText: 'Chứng minh thư, Thẻ căn cước',
                passportText: 'Hộ chiếu',
                licenseText: 'Bằng lái xe',
                otherText: 'Giấy tờ khác',
                modalTitle: 'Hướng dẫn chụp ảnh CMT, CCCD',
                step1Text: 'Bước 1: Chụp mặt trước',
                step2Text: 'Bước 2: Chụp mặt sau',
                instruction1: 'Đưa giấy tờ vào gần camera sao cho 4 góc của giấy tờ trùng với vùng giới hạn',
                instruction2: 'Chụp rõ nét và đầy đủ thông tin trên giấy tờ',
                badExample1: 'Không chụp quá mờ',
                badExample2: 'Không chụp mất góc',
                badExample3: 'Không chụp lóa sáng',
                startBtn: 'BẮT ĐẦU',
                cameraTitle: 'CHỤP MẶT TRƯỚC',
                captureBtnText: 'CHỤP ẢNH',
                uploadBtnText: 'TẢI ẢNH LÊN',
                cameraInstructions: 'Xin vui lòng đặt giấy tờ nằm vừa khung hình chữ nhật, chụp đủ ánh sáng và rõ nét',
                guideLink: 'Hướng dẫn',
                faceTitle: 'XÁC THỰC KHUÔN MẶT',
                faceCaptureBtnText: 'CHỤP ẢNH',
                faceInstructions: 'Đặt khuôn mặt vào khung hình oval và giữ yên',
                loadingText: 'Đang tải mô hình AI...',
                progressStep: 'Bước',
                faceProgressStep: 'Bước 3/4',
                faceDetected: 'Đã phát hiện khuôn mặt',
                faceNotDetected: 'Không phát hiện khuôn mặt',
                positionFace: 'Hãy đặt mặt vào khung oval',
                cameraError: 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.',
                modelLoadError: 'Không thể tải mô hình AI. Vui lòng thử lại.',
                captureSuccess: 'Chụp ảnh thành công!',
                processingImage: 'Đang xử lý ảnh...'
            },
            en: {
                mainTitle: 'Document Verification',
                mainSubtitle: 'Choose the document you want to verify',
                idCardText: 'ID Card, Citizen ID',
                passportText: 'Passport',
                licenseText: 'Driver License',
                otherText: 'Other Documents',
                modalTitle: 'ID Card Photo Guidelines',
                step1Text: 'Step 1: Take front photo',
                step2Text: 'Step 2: Take back photo',
                instruction1: 'Place document close to camera so all 4 corners align with the frame',
                instruction2: 'Take clear and complete photos of document information',
                badExample1: 'Don\'t take blurry photos',
                badExample2: 'Don\'t cut corners',
                badExample3: 'Don\'t take photos with glare',
                startBtn: 'START',
                cameraTitle: 'TAKE FRONT PHOTO',
                captureBtnText: 'TAKE PHOTO',
                uploadBtnText: 'UPLOAD PHOTO',
                cameraInstructions: 'Please place document within the rectangular frame, ensure good lighting and clarity',
                guideLink: 'Guide',
                faceTitle: 'FACE VERIFICATION',
                faceCaptureBtnText: 'TAKE PHOTO',
                faceInstructions: 'Place your face in the oval frame and hold still',
                loadingText: 'Loading AI models...',
                progressStep: 'Step',
                faceProgressStep: 'Step 3/4',
                faceDetected: 'Face detected',
                faceNotDetected: 'No face detected',
                positionFace: 'Please position face in oval frame',
                cameraError: 'Cannot access camera. Please check permissions.',
                modelLoadError: 'Cannot load AI models. Please try again.',
                captureSuccess: 'Photo captured successfully!',
                processingImage: 'Processing image...'
            }
        };
        this.init();
    }
    init() {
        this.bindEvents();
        this.updateLanguage();
        this.loadFaceDetectionModels();
    }
    bindEvents() {
        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.currentLanguage = e.target.value;
                this.updateLanguage();
            });
        }
        // Document cards
        const docCards = document.querySelectorAll('.doc-card');
        docCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const docType = card.getAttribute('data-doc-type');
                this.showInstructionModal(docType);
            });
        });
        // Modal close
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideInstructionModal();
            });
        }
        // Modal overlay close
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                this.hideInstructionModal();
            });
        }
        // Start capture button
        const startCapture = document.getElementById('startCapture');
        if (startCapture) {
            startCapture.addEventListener('click', () => {
                this.startDocumentCapture();
            });
        }
        // Camera controls
        const captureBtn = document.getElementById('captureBtn');
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        if (captureBtn) {
            captureBtn.addEventListener('click', () => {
                this.capturePhoto();
            });
        }
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }
        // Face capture button
        const faceCaptureBtn = document.getElementById('faceCaptureBtn');
        if (faceCaptureBtn) {
            faceCaptureBtn.addEventListener('click', () => {
                this.captureFacePhoto();
            });
        }
        // Error close
        const errorClose = document.getElementById('errorClose');
        if (errorClose) {
            errorClose.addEventListener('click', () => {
                this.hideError();
            });
        }
        // Guide link
        const guideLink = document.getElementById('guideLink');
        if (guideLink) {
            guideLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showGuide();
            });
        }
    }
    updateLanguage() {
        const texts = this.translations[this.currentLanguage];
       
        // Update all text elements
        Object.keys(texts).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = texts[key];
            }
        });
        // Update progress indicator
        this.updateProgressIndicator();
    }
    showInstructionModal(docType) {
        this.currentDocType = docType;
        const modal = document.getElementById('instructionModal');
        const modalTitle = document.getElementById('modalTitle');
       
        if (modal && modalTitle) {
            // Update modal title based on document type
            const texts = this.translations[this.currentLanguage];
            let title = texts.modalTitle;
           
            switch (docType) {
                case 'passport':
                    title = this.currentLanguage === 'vi' ? 'Hướng dẫn chụp ảnh Hộ chiếu' : 'Passport Photo Guidelines';
                    break;
                case 'license':
                    title = this.currentLanguage === 'vi' ? 'Hướng dẫn chụp ảnh Bằng lái xe' : 'Driver License Photo Guidelines';
                    break;
                case 'other':
                    title = this.currentLanguage === 'vi' ? 'Hướng dẫn chụp ảnh Giấy tờ khác' : 'Other Document Photo Guidelines';
                    break;
            }
           
            modalTitle.textContent = title;
            modal.classList.remove('hidden');
            modal.classList.add('fade-in');
        }
    }
    hideInstructionModal() {
        const modal = document.getElementById('instructionModal');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('fade-in', 'fade-out');
            }, 300);
        }
    }
    async startDocumentCapture() {
        this.hideInstructionModal();
        this.showCameraInterface();
        await this.initializeCamera();
    }
    showCameraInterface() {
        const mainScreen = document.getElementById('mainScreen');
        const cameraInterface = document.getElementById('cameraInterface');
       
        if (mainScreen && cameraInterface) {
            mainScreen.classList.add('hidden');
            cameraInterface.classList.remove('hidden');
            cameraInterface.classList.add('fade-in');
        }
        this.updateCameraTitle();
        this.updateProgressIndicator();
    }
    updateCameraTitle() {
        const cameraTitle = document.getElementById('cameraTitle');
        if (cameraTitle) {
            const texts = this.translations[this.currentLanguage];
            if (this.currentStep === 1) {
                cameraTitle.textContent = this.currentLanguage === 'vi' ? 'CHỤP MẶT TRƯỚC' : 'TAKE FRONT PHOTO';
            } else if (this.currentStep === 2) {
                cameraTitle.textContent = this.currentLanguage === 'vi' ? 'CHỤP MẶT SAU' : 'TAKE BACK PHOTO';
            }
        }
    }
    updateProgressIndicator() {
        const progressIndicator = document.getElementById('progressIndicator');
        if (progressIndicator) {
            const texts = this.translations[this.currentLanguage];
            progressIndicator.textContent = `${texts.progressStep} ${this.currentStep}/${this.maxSteps}`;
        }
    }
    async initializeCamera() {
        try {
            const videoElement = document.getElementById('videoElement');
            if (!videoElement) return;
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment' // Use back camera for document scanning
                }
            };
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = this.cameraStream;
           
            videoElement.addEventListener('loadedmetadata', () => {
                videoElement.play();
            });
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.showError(this.translations[this.currentLanguage].cameraError);
        }
    }
    async capturePhoto() {
        try {
            const videoElement = document.getElementById('videoElement');
            const canvasElement = document.getElementById('canvasElement');
           
            if (!videoElement || !canvasElement) return;
            const ctx = canvasElement.getContext('2d');
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
           
            ctx.drawImage(videoElement, 0, 0);
           
            // Convert to blob
            canvasElement.toBlob((blob) => {
                this.capturedImages.push({
                    step: this.currentStep,
                    blob: blob,
                    timestamp: Date.now()
                });
               
                this.showSuccess(this.translations[this.currentLanguage].captureSuccess);
                this.nextStep();
            }, 'image/jpeg', 0.8);
        } catch (error) {
            console.error('Photo capture error:', error);
            this.showError('Lỗi khi chụp ảnh. Vui lòng thử lại.');
        }
    }
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        try {
            this.capturedImages.push({
                step: this.currentStep,
                file: file,
                timestamp: Date.now()
            });
            this.showSuccess(this.translations[this.currentLanguage].captureSuccess);
            // Set to face verification step
            this.currentStep = 3;
            // Hide additional interfaces if needed
            const mainScreen = document.getElementById('mainScreen');
            if (mainScreen) mainScreen.classList.add('hidden');
            const instructionModal = document.getElementById('instructionModal');
            if (instructionModal) instructionModal.classList.add('hidden');
            const loadingOverlay = document.getElementById('loadingOverlay');
            if (loadingOverlay) loadingOverlay.classList.add('hidden');
            // Start face verification
            await this.startFaceVerification();
        } catch (error) {
            console.error('File upload error:', error);
            this.showError('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
        }
    }
    nextStep() {
        this.currentStep++;
       
        if (this.currentStep <= 2) {
            // Continue with document capture (front/back)
            this.updateCameraTitle();
            this.updateProgressIndicator();
        } else if (this.currentStep === 3) {
            // Move to face verification
            this.startFaceVerification();
        } else {
            // Complete the process
            this.completeVerification();
        }
    }
    async startFaceVerification() {
        const cameraInterface = document.getElementById('cameraInterface');
        const faceVerification = document.getElementById('faceVerification');
       
        if (cameraInterface && faceVerification) {
            cameraInterface.classList.add('hidden');
            faceVerification.classList.remove('hidden');
            faceVerification.classList.add('fade-in');
        }
        // Stop document camera
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
        await this.initializeFaceCamera();
        this.startFaceDetection();
    }
    async initializeFaceCamera() {
        try {
            const faceVideoElement = document.getElementById('faceVideoElement');
            if (!faceVideoElement) return;
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user' // Use front camera for face verification
                }
            };
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            faceVideoElement.srcObject = this.cameraStream;
           
            faceVideoElement.addEventListener('loadedmetadata', () => {
                faceVideoElement.play();
            });
        } catch (error) {
            console.error('Face camera initialization error:', error);
            this.showError(this.translations[this.currentLanguage].cameraError);
        }
    }
    async loadFaceDetectionModels() {
        try {
            // this.showLoading(true); // Commented out to skip showing loading overlay
           
            // Load face-api.js models
            const modelsLoaded = await window.faceapi.loadModels('./models');
           
            if (modelsLoaded) {
                console.log('Face detection models loaded successfully');
            } else {
                throw new Error('Failed to load models');
            }
           
        } catch (error) {
            console.error('Model loading error:', error);
            this.showError(this.translations[this.currentLanguage].modelLoadError);
        } finally {
            this.showLoading(false);
        }
    }
    async startFaceDetection() {
        if (!window.faceapi || this.faceDetectionActive) return;
       
        this.faceDetectionActive = true;
        const faceVideoElement = document.getElementById('faceVideoElement');
        const faceDetectionStatus = document.getElementById('faceDetectionStatus');
       
        const detectFaces = async () => {
            if (!this.faceDetectionActive || !faceVideoElement) return;
           
            try {
                const detections = await window.faceapi.detectAllFaces(faceVideoElement);
               
                if (detections && detections.length > 0) {
                    if (faceDetectionStatus) {
                        faceDetectionStatus.textContent = this.translations[this.currentLanguage].faceDetected;
                        faceDetectionStatus.style.background = 'rgba(0, 212, 170, 0.8)';
                    }
                    this.drawFaceDetections(detections);
                } else {
                    if (faceDetectionStatus) {
                        faceDetectionStatus.textContent = this.translations[this.currentLanguage].positionFace;
                        faceDetectionStatus.style.background = 'rgba(255, 193, 7, 0.8)';
                    }
                }
               
            } catch (error) {
                console.error('Face detection error:', error);
            }
           
            if (this.faceDetectionActive) {
                requestAnimationFrame(detectFaces);
            }
        };
       
        detectFaces();
    }
    drawFaceDetections(detections) {
        const faceVideoElement = document.getElementById('faceVideoElement');
        const overlay = document.getElementById('faceDetectionOverlay');
       
        if (!overlay || !faceVideoElement) return;
       
        // Clear previous detections
        overlay.innerHTML = '';
       
        detections.forEach(detection => {
            const { x, y, width, height } = detection.detection.box;
           
            // Scale coordinates to video element size
            const scaleX = faceVideoElement.offsetWidth / faceVideoElement.videoWidth;
            const scaleY = faceVideoElement.offsetHeight / faceVideoElement.videoHeight;
           
            const box = document.createElement('div');
            box.className = 'face-detection-box';
            box.style.left = `${x * scaleX}px`;
            box.style.top = `${y * scaleY}px`;
            box.style.width = `${width * scaleX}px`;
            box.style.height = `${height * scaleY}px`;
           
            overlay.appendChild(box);
        });
    }
    async captureFacePhoto() {
        try {
            const faceVideoElement = document.getElementById('faceVideoElement');
            const faceCanvasElement = document.getElementById('faceCanvasElement');
           
            if (!faceVideoElement || !faceCanvasElement) return;
            const ctx = faceCanvasElement.getContext('2d');
            faceCanvasElement.width = faceVideoElement.videoWidth;
            faceCanvasElement.height = faceVideoElement.videoHeight;
           
            ctx.drawImage(faceVideoElement, 0, 0);
           
            // Stop face detection
            this.faceDetectionActive = false;
           
            // Convert to blob
            faceCanvasElement.toBlob((blob) => {
                this.capturedImages.push({
                    step: this.currentStep,
                    blob: blob,
                    timestamp: Date.now(),
                    type: 'face'
                });
               
                this.showSuccess(this.translations[this.currentLanguage].captureSuccess);
                this.nextStep();
            }, 'image/jpeg', 0.8);
        } catch (error) {
            console.error('Face photo capture error:', error);
            this.showError('Lỗi khi chụp ảnh khuôn mặt. Vui lòng thử lại.');
        }
    }
    completeVerification() {
        // Stop camera
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }
       
        this.faceDetectionActive = false;
       
        // Show completion message
        this.showSuccess('Xác thực hoàn tất! Cảm ơn bạn đã sử dụng dịch vụ.');
       
        // Reset after 3 seconds
        setTimeout(() => {
            this.resetApplication();
        }, 3000);
    }
    resetApplication() {
        this.currentStep = 1;
        this.currentDocType = null;
        this.capturedImages = [];
        this.faceDetectionActive = false;
       
        // Hide all screens except main
        const screens = ['cameraInterface', 'faceVerification', 'instructionModal'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.add('hidden');
            }
        });
       
        // Show main screen
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.classList.remove('hidden');
        }
       
        this.hideError();
    }
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
       
        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
           
            // Auto hide after 5 seconds
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }
    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
    }
    showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'error-message'; // Reuse error styling
        successDiv.innerHTML = `
            <div class="error-content" style="background: #28a745;">
                <span class="error-icon">✓</span>
                <span>${message}</span>
            </div>
        `;
       
        document.body.appendChild(successDiv);
       
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 3000);
    }
    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.remove('hidden');
            } else {
                loadingOverlay.classList.add('hidden');
            }
        }
    }
    showGuide() {
        // Show guide modal or navigate to guide page
        alert(this.translations[this.currentLanguage].guideLink + ' - Feature coming soon!');
    }
}
// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.eKYCApp = new EKYCApp();
});
// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.eKYCApp) {
        // Pause face detection when page is hidden
        window.eKYCApp.faceDetectionActive = false;
    }
});
// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.eKYCApp && window.eKYCApp.cameraStream) {
        window.eKYCApp.cameraStream.getTracks().forEach(track => track.stop());
    }
});
