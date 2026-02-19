// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA3uZwvqve8tYjMCfUTekLM69IyU52DzpM",
    authDomain: "makati-garage.firebaseapp.com",
    projectId: "makati-garage",
    storageBucket: "makati-garage.firebasestorage.app",
    messagingSenderId: "46132778876",
    appId: "1:46132778876:web:357d0085818b682d6c76f9"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const contentWrapper = document.getElementById('content-wrapper');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginConfirmation = document.getElementById('loginConfirmation');
    const loginError = document.getElementById('loginError');
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    const registerConfirmation = document.getElementById('registerConfirmation');
    const registerError = document.getElementById('registerError');
    const registerErrorMessage = document.getElementById('registerErrorMessage');

    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');

    const bookingForm = document.getElementById('bookingForm');
    const confirmationMessage = document.getElementById('confirmation');
    const contactForm = document.getElementById('contactForm');
    const contactConfirmation = document.getElementById('contactConfirmation');

    const timeSlotsContainer = document.getElementById('time-slots-container');
    const selectedTimeInput = document.getElementById('selected-time');
    const myBookingsPage = document.getElementById('my-bookings-page');
    const bookingRecordsContainer = document.getElementById('booking-records-container');
    const myBookingsMessage = document.getElementById('myBookingsMessage');

    // Current user tracking
    let currentUser = null;

    // Available time slots
    const availableTimeSlots = [
        '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
        '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
        '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
    ];

    // --- Background Slideshow ---
    let slideIndex = 0;
    const slides = document.querySelectorAll('.main-background .slide');

    function showSlides() {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === slideIndex) {
                slide.classList.add('active');
            }
        });
        slideIndex = (slideIndex + 1) % slides.length;
        setTimeout(showSlides, 5000);
    }
    showSlides();

    // --- Threads Background Animation ---
    class Threads {
        constructor({ target, props = {} }) {
            this.container = target;
            this.props = {
                color: [1, 1, 1],
                amplitude: 1,
                distance: 0,
                enableMouseInteraction: false,
                ...props
            };
            
            this.animationFrameId = null;
            this.init();
        }
        
        init() {
            if (!this.container) return;
            
            // Create renderer
            this.renderer = new Renderer({ alpha: true });
            this.gl = this.renderer.gl;
            this.gl.clearColor(0, 0, 0, 0);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.container.appendChild(this.gl.canvas);
            
            // Create geometry and program
            this.geometry = new Triangle(this.gl);
            this.program = new Program(this.gl, {
                vertex: `
                    attribute vec2 position;
                    attribute vec2 uv;
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = vec4(position, 0.0, 1.0);
                    }
                `,
                fragment: `
                    precision highp float;
                    uniform float iTime;
                    uniform vec3 iResolution;
                    uniform vec3 uColor;
                    uniform float uAmplitude;
                    uniform float uDistance;
                    uniform vec2 uMouse;
                    #define PI 3.1415926538
                    const int u_line_count = 40;
                    const float u_line_width = 7.0;
                    const float u_line_blur = 10.0;
                    
                    float Perlin2D(vec2 P) {
                        vec2 Pi = floor(P);
                        vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
                        vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
                        Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
                        Pt += vec2(26.0, 161.0).xyxy;
                        Pt *= Pt;
                        Pt = Pt.xzxz * Pt.yyww;
                        vec4 hash_x = fract(Pt * (1.0 / 951.135664));
                        vec4 hash_y = fract(Pt * (1.0 / 642.949883));
                        vec4 grad_x = hash_x - 0.49999;
                        vec4 grad_y = hash_y - 0.49999;
                        vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
                            * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
                        grad_results *= 1.4142135623730950;
                        vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
                                     * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
                        vec4 blend2 = vec4(blend, vec2(1.0 - blend));
                        return dot(grad_results, blend2.zxzx * blend2.wwyy);
                    }
                    
                    float pixel(float count, vec2 resolution) {
                        return (1.0 / max(resolution.x, resolution.y)) * count;
                    }
                    
                    float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
                        float split_offset = (perc * 0.4);
                        float split_point = 0.1 + split_offset;
                        float amplitude_normal = smoothstep(split_point, 0.7, st.x);
                        float amplitude_strength = 0.5;
                        float finalAmplitude = amplitude_normal * amplitude_strength
                                                * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);
                        float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
                        float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;
                        float xnoise = mix(
                            Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
                            Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
                            st.x * 0.3
                        );
                        float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;
                        float line_start = smoothstep(
                            y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
                            y,
                            st.y
                        );
                        float line_end = smoothstep(
                            y,
                            y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
                            st.y
                        );
                        return clamp(
                            (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
                            0.0,
                            1.0
                        );
                    }
                    
                    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
                        vec2 uv = fragCoord / iResolution.xy;
                        float line_strength = 1.0;
                        for (int i = 0; i < u_line_count; i++) {
                            float p = float(i) / float(u_line_count);
                            line_strength *= (1.0 - lineFn(
                                uv,
                                u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
                                p,
                                (PI * 1.0) * p,
                                uMouse,
                                iTime,
                                uAmplitude,
                                uDistance
                            ));
                        }
                        float colorVal = 1.0 - line_strength;
                        fragColor = vec4(uColor * colorVal, colorVal);
                    }
                    
                    void main() {
                        mainImage(gl_FragColor, gl_FragCoord.xy);
                    }
                `,
                uniforms: {
                    iTime: { value: 0 },
                    iResolution: { value: new Color() },
                    uColor: { value: new Color(...this.props.color) },
                    uAmplitude: { value: this.props.amplitude },
                    uDistance: { value: this.props.distance },
                    uMouse: { value: new Float32Array([0.5, 0.5]) },
                },
            });
            
            // Create mesh
            this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
            
            // Setup resize handler
            this.resize();
            window.addEventListener('resize', this.resize.bind(this));
            
            // Mouse interaction setup
            this.currentMouse = [0.5, 0.5];
            this.targetMouse = [0.5, 0.5];
            
            if (this.props.enableMouseInteraction) {
                this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
                this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
            }
            
            // Start animation
            this.animationFrameId = requestAnimationFrame(this.update.bind(this));
        }
        
        resize() {
            const { clientWidth, clientHeight } = this.container;
            this.renderer.setSize(clientWidth, clientHeight);
            this.program.uniforms.iResolution.value.r = clientWidth;
            this.program.uniforms.iResolution.value.g = clientHeight;
            this.program.uniforms.iResolution.value.b = clientWidth / clientHeight;
        }
        
        handleMouseMove(e) {
            const rect = this.container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            this.targetMouse = [x, y];
        }
        
        handleMouseLeave() {
            this.targetMouse = [0.5, 0.5];
        }
        
        update(t) {
            if (this.props.enableMouseInteraction) {
                const smoothing = 0.05;
                this.currentMouse[0] += smoothing * (this.targetMouse[0] - this.currentMouse[0]);
                this.currentMouse[1] += smoothing * (this.targetMouse[1] - this.currentMouse[1]);
                this.program.uniforms.uMouse.value[0] = this.currentMouse[0];
                this.program.uniforms.uMouse.value[1] = this.currentMouse[1];
            } else {
                this.program.uniforms.uMouse.value[0] = 0.5;
                this.program.uniforms.uMouse.value[1] = 0.5;
            }
            
            this.program.uniforms.iTime.value = t * 0.001;
            this.renderer.render({ scene: this.mesh });
            this.animationFrameId = requestAnimationFrame(this.update.bind(this));
        }
        
        destroy() {
            if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
            window.removeEventListener('resize', this.resize.bind(this));
            
            if (this.props.enableMouseInteraction) {
                this.container.removeEventListener('mousemove', this.handleMouseMove.bind(this));
                this.container.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
            }
            
            if (this.container.contains(this.gl.canvas)) {
                this.container.removeChild(this.gl.canvas);
            }
            
            this.gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
    }

    // Dummy OGL library components
    class Color extends Float32Array {
        constructor(r = 0, g = 0, b = 0) {
            super([r, g, b]);
        }
    }

    class Vec2 extends Float32Array {
        constructor(x = 0, y = 0) {
            super([x, y]);
        }
    }

    class Triangle {
        constructor(gl) {
            this.gl = gl;
            this.positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            
            this.uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 2, 0, 0, 2]), gl.STATIC_DRAW);
        }
    }

    class Program {
        constructor(gl, { vertex, fragment, uniforms }) {
            this.gl = gl;
            this.uniforms = uniforms;

            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, vertex);
            gl.compileShader(vertexShader);

            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, fragment);
            gl.compileShader(fragmentShader);

            this.program = gl.createProgram();
            gl.attachShader(this.program, vertexShader);
            gl.attachShader(this.program, fragmentShader);
            gl.linkProgram(this.program);

            this.compileUniforms();
        }

        compileUniforms() {
            this.uniformLocations = {};
            for (const key in this.uniforms) {
                this.uniformLocations[key] = this.gl.getUniformLocation(this.program, key);
            }
        }

        use() {
            this.gl.useProgram(this.program);
            for (const key in this.uniforms) {
                const uniform = this.uniforms[key];
                const location = this.uniformLocations[key];
                if (location === null) continue;

                if (uniform.value instanceof Color) {
                    this.gl.uniform3fv(location, uniform.value);
                } else if (uniform.value instanceof Float32Array && uniform.value.length === 2) {
                    this.gl.uniform2fv(location, uniform.value);
                } else if (typeof uniform.value === 'number') {
                    this.gl.uniform1f(location, uniform.value);
                }
            }
        }
    }

    class Mesh {
        constructor(gl, { geometry, program }) {
            this.gl = gl;
            this.geometry = geometry;
            this.program = program;
        }
    }

    class Renderer {
        constructor({ gl, alpha = false }) {
            this.gl = gl || document.createElement('canvas').getContext('webgl', { alpha });
            if (!gl) document.body.appendChild(this.gl.canvas);
        }

        setSize(width, height) {
            this.gl.canvas.width = width;
            this.gl.canvas.height = height;
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        }

        render({ scene }) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            scene.program.use();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, scene.geometry.positionBuffer);
            const positionLoc = this.gl.getAttribLocation(scene.program.program, 'position');
            this.gl.enableVertexAttribArray(positionLoc);
            this.gl.vertexAttribPointer(positionLoc, 2, this.gl.FLOAT, false, 0, 0);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, scene.geometry.uvBuffer);
            const uvLoc = this.gl.getAttribLocation(scene.program.program, 'uv');
            this.gl.enableVertexAttribArray(uvLoc);
            this.gl.vertexAttribPointer(uvLoc, 2, this.gl.FLOAT, false, 0, 0);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        }
    }

    // Initialize Threads background
    new Threads({
        target: document.getElementById('threads-background'),
        props: {
            color: [240 / 255, 8 / 255, 8 / 255],
            amplitude: 1.0,
            distance: 0.8,
            enableMouseInteraction: true
        }
    });

    // --- Auth Tab Switching ---
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(tab.dataset.tab + '-form').classList.add('active');
            loginConfirmation.style.display = 'none';
            loginError.style.display = 'none';
            registerConfirmation.style.display = 'none';
            registerError.style.display = 'none';
        });
    });

    // --- Login Logic ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            currentUser = userCredential.user;
            
            loginConfirmation.style.display = 'block';
            loginError.style.display = 'none';
            setTimeout(() => {
                authContainer.classList.add('hidden');
                contentWrapper.classList.add('visible');
                showPage('services-page');
                updateAuthFormFields();
            }, 1000);
        } catch (error) {
            loginError.style.display = 'block';
            loginErrorMessage.textContent = error.message;
            loginConfirmation.style.display = 'none';
        }
    });

    // --- Registration Logic ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        if (password !== confirmPassword) {
            registerError.style.display = 'block';
            registerErrorMessage.textContent = 'Passwords do not match.';
            registerConfirmation.style.display = 'none';
            return;
        }

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await db.collection('users').doc(userCredential.user.uid).set({
                name,
                email,
                phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            registerConfirmation.style.display = 'block';
            registerError.style.display = 'none';
            
            setTimeout(() => {
                document.querySelector('.auth-tab[data-tab="login"]').click();
                document.getElementById('login-email').value = email;
            }, 1500);
        } catch (error) {
            registerError.style.display = 'block';
            registerErrorMessage.textContent = error.message;
            registerConfirmation.style.display = 'none';
        }
    });

    // --- Logout Logic ---
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            currentUser = null;
            authContainer.classList.remove('hidden');
            contentWrapper.classList.remove('visible');
            loginForm.reset();
            registerForm.reset();
            loginConfirmation.style.display = 'none';
            loginError.style.display = 'none';
            registerConfirmation.style.display = 'none';
            registerError.style.display = 'none';
            document.querySelector('.auth-tab[data-tab="login"]').click();
        });
    });

    // Check auth state on load
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            authContainer.classList.add('hidden');
            contentWrapper.classList.add('visible');
            showPage('services-page');
            updateAuthFormFields();
        }
    });

    // --- Navigation Logic ---
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');

        navLinks.forEach(link => link.classList.remove('active'));
        document.querySelector(`.nav-link[data-page="${pageId.replace('-page', '')}"]`).classList.add('active');
        
        if (pageId === 'my-bookings-page') {
            loadUserBookings();
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page + '-page');
        });
    });

    // --- Generate Time Slots ---
    async function generateTimeSlots(selectedDate) {
        timeSlotsContainer.innerHTML = '';
        selectedTimeInput.value = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(selectedDate);
        inputDate.setHours(0, 0, 0, 0);
        const isToday = inputDate.getTime() === today.getTime();

        try {
            // Get all bookings for this date from Firestore
            const snapshot = await db.collection('bookings')
                .where('date', '==', selectedDate)
                .get();

            const bookedSlots = snapshot.docs.map(doc => doc.data().time);

            availableTimeSlots.forEach(time => {
                const timeSlotDiv = document.createElement('div');
                timeSlotDiv.classList.add('time-slot');
                timeSlotDiv.textContent = time;
                timeSlotDiv.dataset.time = time;

                const isBooked = bookedSlots.includes(time);
                
                if (isBooked) {
                    timeSlotDiv.classList.add('booked');
                } else {
                    if (isToday) {
                        const [hour, minutePart] = time.split(':');
                        const currentHour = new Date().getHours();
                        const currentMinute = new Date().getMinutes();
                        let slotHour = parseInt(hour);
                        const ampm = minutePart.split(' ')[1];

                        if (ampm === 'PM' && slotHour !== 12) {
                            slotHour += 12;
                        }
                        if (ampm === 'AM' && slotHour === 12) {
                            slotHour = 0; 
                        }
                        
                        if (slotHour < currentHour || (slotHour === currentHour && parseInt(minutePart) <= currentMinute)) {
                            timeSlotDiv.classList.add('booked');
                        } else {
                            timeSlotDiv.addEventListener('click', () => {
                                document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                                timeSlotDiv.classList.add('selected');
                                selectedTimeInput.value = time;
                            });
                        }
                    } else {
                        timeSlotDiv.addEventListener('click', () => {
                            document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
                            timeSlotDiv.classList.add('selected');
                            selectedTimeInput.value = time;
                        });
                    }
                }
                timeSlotsContainer.appendChild(timeSlotDiv);
            });
        } catch (error) {
            console.error("Error generating time slots: ", error);
        }
    }

    // Event listener for date input change
    document.getElementById('date').addEventListener('change', (e) => {
        generateTimeSlots(e.target.value);
    });

    // Initial generation of time slots
    const todayDate = new Date().toISOString().slice(0, 10);
    document.getElementById('date').value = todayDate;
    document.getElementById('date').min = todayDate;
    generateTimeSlots(todayDate);

    // --- Booking Form Submission ---
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const date = document.getElementById('date').value;
        const time = selectedTimeInput.value;
        const service = document.getElementById('service').value;
        const notes = document.getElementById('notes').value;

        if (!time) {
            alert('Please select a time slot.');
            return;
        }

        try {
            // Check if slot is available
            const snapshot = await db.collection('bookings')
                .where('date', '==', date)
                .where('time', '==', time)
                .get();

            if (!snapshot.empty) {
                alert('This time slot is already booked. Please choose another one.');
                return;
            }

            // Add booking to Firestore
            await db.collection('bookings').add({
                userId: currentUser ? currentUser.uid : 'guest',
                name,
                email,
                phone,
                date,
                time,
                service,
                notes,
                status: 'Pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            confirmationMessage.style.display = 'block';
            bookingForm.reset();
            selectedTimeInput.value = '';
            generateTimeSlots(document.getElementById('date').value);

            setTimeout(() => {
                confirmationMessage.style.display = 'none';
            }, 5000);
        } catch (error) {
            alert('Error submitting booking: ' + error.message);
        }
    });

    // --- Contact Form Submission ---
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        contactConfirmation.style.display = 'block';
        contactForm.reset();

        setTimeout(() => {
            contactConfirmation.style.display = 'none';
        }, 5000);
    });

    // --- Update Booking Form with Current User Data ---
    async function updateAuthFormFields() {
        if (currentUser) {
            try {
                const userDoc = await db.collection('users').doc(currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    document.getElementById('name').value = userData.name || '';
                    document.getElementById('email').value = currentUser.email || '';
                    document.getElementById('phone').value = userData.phone || '';
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        } else {
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('phone').value = '';
        }
    }

    // --- Load User Bookings ---
    async function loadUserBookings() {
        bookingRecordsContainer.innerHTML = '';

        if (!currentUser) {
            myBookingsMessage.style.display = 'block';
            return;
        }

        try {
            const snapshot = await db.collection('bookings')
                .where('userId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                myBookingsMessage.style.display = 'block';
            } else {
                myBookingsMessage.style.display = 'none';
                snapshot.forEach(doc => {
                    const booking = doc.data();
                    const bookingRecordDiv = document.createElement('div');
                    bookingRecordDiv.classList.add('booking-record');
                    bookingRecordDiv.innerHTML = `
                        <p><strong>Service:</strong> ${booking.service}</p>
                        <p><strong>Date:</strong> ${booking.date}</p>
                        <p><strong>Time:</strong> ${booking.time}</p>
                        <p><strong>Status:</strong> ${booking.status}</p>
                        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
                    `;
                    bookingRecordsContainer.appendChild(bookingRecordDiv);
                });
            }
        } catch (error) {
            console.error("Error loading bookings: ", error);
            myBookingsMessage.style.display = 'block';
            myBookingsMessage.textContent = 'Error loading bookings. Please try again.';
        }
    }
});
