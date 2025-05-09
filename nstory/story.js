document.addEventListener('DOMContentLoaded', function() {
    // Add a flag to track if voice is playing
    let isVoicePlaying = false;
    let isWaitingForChessBoard = false;
    // Add a flag to track if initial scroll has happened
    let hasInitialScrolled = false;

    // Voice lines for each character's dialogs
    const characterVoiceLines = {
        'Arisu Valenhart': {
            "I didn't come this far to lose, Alaxander. This match is mine.": new Audio('../asounds/arisu_line1.mp3'),
            "This isn't just a game. I'm here to win—and break your defense wide open.": new Audio('../asounds/arisu_line2.mp3'),
            "You miscalculated. You underestimated me.": new Audio('../asounds/arisu_line3.mp3'),
            "Time to sacrifice! Game over, Alaxander.": new Audio('../asounds/arisu_line4.mp3')
        },
        'Grandmaster Alaxander': {
            "I've crushed countless challengers. But you... you're different. I'll admit that.": (() => {
                const audio = new Audio('../asounds/alaxander_line1.mp3');
                audio.playbackRate = 1.5; // 20% faster
                return audio;
            })(),
            "You've got confidence. But that won't be enough.": (() => {
                const audio = new Audio('../asounds/alaxander_line2.mp3');
                audio.playbackRate = 1.3;
                return audio;
            })(),
            "It's not over yet. Brace for my full strategy.": (() => {
                const audio = new Audio('../asounds/alaxander_line3.mp3');
                audio.playbackRate = 1.3;
                return audio;
            })(),
            "Resign... You were better. Today, you win.": (() => {
                const audio = new Audio('../asounds/alaxander_line4.mp3');
                audio.playbackRate = 1.5;
                return audio;
            })()
        },
        'Commentator': {
            "The tension in the arena was palpable. Every spectator held their breath, the world watching as the two masters of the digital chessboard prepared for battle. The first move was all it would take to set the stage for the outcome. Who would blink first?": (() => {
                const audio = new Audio('../asounds/commentator_line1.mp3');
                audio.preload = 'auto';
                // Add error listener for debugging
                audio.addEventListener('error', (e) => {
                    console.error('Commentator audio error:', e);
                });
                return audio;
            })(),
            "The board crackled. Arisu attacked. Alaxander waited—one mistake, and it's over.": new Audio('../asounds/commentator_line2.mp3'),
            "Unbelievable! Arisu sacrificed his queen—checkmate! The crowd went wild. The underdog had dethroned a legend.": new Audio('../asounds/commentator_line3.mp3')
        }
    };

    // Set volume for all voice lines
    Object.values(characterVoiceLines).forEach(characterLines => {
        Object.values(characterLines).forEach(audio => {
            audio.volume = 1; // Adjust volume as needed
        });
    });

    // Create background elements
    const backgroundContainer = document.createElement('div');
    backgroundContainer.className = 'rpg-background';
    
    const gridOverlay = document.createElement('div');
    gridOverlay.className = 'grid-overlay';
    
    const ambientLight = document.createElement('div');
    ambientLight.className = 'ambient-light';
    
    // Add elements to the page
    document.body.prepend(backgroundContainer);
    document.body.prepend(gridOverlay);
    document.body.prepend(ambientLight);

    // Initialize particle effects (keeping existing particle code)
    initializeParticleEffects();

    // Dialog system
    const storyBoxes = document.querySelectorAll('.story-box');
    const storyTitle = document.querySelector('.story-title');
    const storyContainer = document.querySelector('.story-container');
    let currentDialogIndex = -1; // Start before first dialog
    
    // Hide all story boxes initially
    storyBoxes.forEach(box => {
        box.style.opacity = '0';
        box.style.transform = 'translateY(20px)';
        box.style.display = 'none';
    });

    // Show story title with animation
    storyTitle.style.opacity = '0';
    storyTitle.style.transform = 'translateY(20px)';
    setTimeout(() => {
        storyTitle.style.transition = 'all 0.5s ease';
        storyTitle.style.opacity = '1';
        storyTitle.style.transform = 'translateY(0)';
    }, 500);

    // Function to smoothly scroll to the bottom
    function scrollToBottom() {
        const scrollTarget = document.documentElement.scrollHeight;
        window.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
        });
    }

    // Function to show next dialog
    function showNextDialog() {
        if (isWaitingForChessBoard) {
            return;
        }
        
        currentDialogIndex++;
        
        if (currentDialogIndex < storyBoxes.length) {
            const currentBox = storyBoxes[currentDialogIndex];
            
            currentBox.style.display = 'block';
            currentBox.style.transition = 'all 0.5s ease';
            
            currentBox.offsetHeight;
            
            const isChessScene = currentBox.classList.contains('chess-scene');
            
            setTimeout(() => {
                currentBox.style.opacity = '1';
                currentBox.style.transform = 'translateY(0)';
                // Initial scroll when dialog appears
                scrollToBottom();

                if (isChessScene) {
                    isWaitingForChessBoard = true;
                    const existingIndicator = document.querySelector('.click-indicator');
                    if (existingIndicator) {
                        existingIndicator.remove();
                    }
                    
                    setTimeout(() => {
                        isWaitingForChessBoard = false;
                        if (currentDialogIndex < storyBoxes.length - 1) {
                            createClickIndicator();
                        } else {
                            showContinueButton();
                        }
                    }, 3000);
                } else {
                    if (currentDialogIndex < storyBoxes.length - 1) {
                        createClickIndicator();
                    } else {
                        showContinueButton();
                    }
                }
            }, 50);

            if (currentBox.classList.contains('background-story')) {
                addBackgroundStoryEffects(currentBox);
            } else {
                addCharacterDialogEffects(currentBox);
            }
        }
    }

    function addBackgroundStoryEffects(box) {
        box.style.animation = 'glowPulse 2s infinite';
    }

    function addCharacterDialogEffects(box) {
        const textElement = box.querySelector('.story-text p');
        const characterName = box.querySelector('.story-text h2')?.textContent;
        const text = textElement?.textContent;
        
        const isChessScene = box.classList.contains('chess-scene');
        
        textElement.textContent = '';
        let i = 0;

        if (characterVoiceLines[characterName] && characterVoiceLines[characterName][text?.trim()]) {
            const voiceLine = characterVoiceLines[characterName][text.trim()];
            console.log('Found voice line:', voiceLine);
            
            voiceLine.currentTime = 0;
            voiceLine.volume = 1;
            
            const playAudio = async () => {
                try {
                    isVoicePlaying = true;
                    await voiceLine.play();
                    console.log('Audio playing successfully');
                } catch (error) {
                    console.error('Playback error:', error);
                    isVoicePlaying = false;
                }
            };

            playAudio();

            voiceLine.addEventListener('ended', () => {
                console.log('Audio finished playing');
                isVoicePlaying = false;
                if (currentDialogIndex < storyBoxes.length - 1) {
                    if (isChessScene) {
                        setTimeout(() => createClickIndicator(), 3000);
                    } else {
                        createClickIndicator();
                    }
                }
            });
        } else {
            console.log('No matching voice line found');
            if (isChessScene) {
                setTimeout(() => {
                    if (currentDialogIndex < storyBoxes.length - 1) {
                        createClickIndicator();
                    }
                }, 3000);
            } else {
                if (currentDialogIndex < storyBoxes.length - 1) {
                    createClickIndicator();
                }
            }
        }

        // Modified typeWriter function to only scroll once at the start
        function typeWriter() {
            if (i < text.length) {
                textElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 40);
                // Only scroll once when dialog starts
                if (i === 3) {  // Scroll after first few characters
                    scrollToBottom();
                }
            }
        }
        
        if (text) {
            typeWriter();
        }
    }

    function createClickIndicator() {
        if (isVoicePlaying) return;

        // Remove existing indicator if present
        const existingIndicator = document.querySelector('.click-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const indicator = document.createElement('div');
        indicator.className = 'click-indicator';
        indicator.innerHTML = `
            <div class="pulse-ring"></div>
            <div class="click-text">Tap to continue</div>
        `;
        document.body.appendChild(indicator);

        indicator.style.position = 'fixed';
        indicator.style.bottom = '20px';
        indicator.style.left = '50%';
        indicator.style.transform = 'translateX(-50%)';
        indicator.style.zIndex = '1000';
    }

    function showContinueButton() {
        const continueButton = document.querySelector('.continue-button');
        if (continueButton) {
            continueButton.style.display = 'block';
            continueButton.style.animation = 'buttonPulse 2s infinite';
            scrollToBottom();
        }
    }

    // Handle click/tap events
    document.addEventListener('click', () => {
        // Don't proceed if we're waiting for chess board or voice is playing
        if (isWaitingForChessBoard || isVoicePlaying) {
            return;
        }

        // Remove existing click indicator if present
        const existingIndicator = document.querySelector('.click-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Stop any currently playing voice line
        if (currentDialogIndex >= 0 && currentDialogIndex < storyBoxes.length) {
            const currentBox = storyBoxes[currentDialogIndex];
            const characterName = currentBox.querySelector('.story-text h2')?.textContent;
            const text = currentBox.querySelector('.story-text p')?.textContent;
            
            if (characterVoiceLines[characterName] && characterVoiceLines[characterName][text?.trim()]) {
                characterVoiceLines[characterName][text.trim()].pause();
                characterVoiceLines[characterName][text.trim()].currentTime = 0;
            }
        }
        
        showNextDialog();
    });

    // Show first dialog automatically after title animation
    setTimeout(showNextDialog, 1500);

    // Add smooth scrolling behavior to the page
    document.documentElement.style.scrollBehavior = 'smooth';

    // Preload all voice lines
    function preloadVoiceLines() {
        Object.entries(characterVoiceLines).forEach(([character, lines]) => {
            Object.entries(lines).forEach(([text, audio]) => {
                console.log(`Loading audio for ${character}: ${text.substring(0, 30)}...`);
                audio.load();
                audio.addEventListener('canplaythrough', () => {
                    console.log(`Audio loaded successfully for ${character}`);
                });
                audio.addEventListener('error', (e) => {
                    console.error(`Audio load error for ${character}:`, e);
                });
            });
        });
    }

    // Preload voice lines when page loads
    preloadVoiceLines();
});

// Add these to your existing particle effects code
function initializeParticleEffects() {
    const particlesContainer = document.querySelector('.combat-particles');
    
    // Create combat particles
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size between 2 and 6 pixels
        const size = Math.random() * 4 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Add to container
        particlesContainer.appendChild(particle);
        
        // Animate
        particle.animate([
            { 
                opacity: 0,
                transform: 'scale(0) translateY(0)'
            },
            { 
                opacity: 1,
                transform: 'scale(1) translateY(-20px)'
            },
            { 
                opacity: 0,
                transform: 'scale(0) translateY(-40px)'
            }
        ], {
            duration: 2000,
            easing: 'ease-out'
        }).onfinish = () => {
            particle.remove();
        };
    }
    
    // Create particles periodically
    setInterval(createParticle, 200);
    
    // Create energy waves on click
    document.addEventListener('click', (e) => {
        const wave = document.createElement('div');
        wave.className = 'energy-wave';
        wave.style.left = `${e.clientX}px`;
        wave.style.top = `${e.clientY}px`;
        document.body.appendChild(wave);
        
        setTimeout(() => wave.remove(), 2000);
    });
}
























