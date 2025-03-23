// ==UserScript==
// @name         Tlem AutoPrompt v3
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Enhanced Tlem helper with modern UI and improved code organization
// @author       ArturM
// @match        https://edu.t-lem.com/*
// @updateURL    https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_AutoPromptv3.user.js
// @downloadURL  https://github.com/Rutra09/tlem_autoprompt/raw/master/Tlem_AutoPromptv3.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=t-lem.com
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/**
 * Tlem AutoPrompt v3
 * A userscript to enhance the Tlem learning platform with automated prompts and helpers
 * Features modern dark UI based on Radix design principles
 */

// Constants
const API_BASE_URL = 'http://tlem.arturm.pl';
const COLORS = {
  background: '#1a1a1a',
  surface: '#2a2a2a',
  primary: '#6e56cf', // Radix violet
  primaryHover: '#7c66d9',
  secondary: '#16a34a', // Radix green
  secondaryHover: '#22c55e',
  danger: '#e11d48', // Radix red
  dangerHover: '#f43f5e',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  border: '#3f3f46',
};

// Utility functions
const Utils = {
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise} - Promise that resolves when text is copied
   */
  copyToClipboard: (text) => {
    return navigator.clipboard.writeText(text);
  },
  
  /**
   * Get lesson ID from URL
   * @returns {string} - Lesson ID
   */
  getLessonID: () => {
    const url = window.location.href;
    return url.split(':')[2];
  },
  
  /**
   * Make API request
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} data - Request data
   * @returns {Promise} - Promise that resolves with response
   */
  apiRequest: (endpoint, method = 'GET', data = null) => {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: method,
        url: `${API_BASE_URL}${endpoint}`,
        data: data ? JSON.stringify(data) : undefined,
        headers: data ? { 'Content-Type': 'application/json' } : undefined,
        onload: (response) => {
          try {
            if (response.status >= 200 && response.status < 300) {
              resolve(response.responseText);
            } else {
              reject(new Error(`API request failed with status ${response.status}`));
            }
          } catch (error) {
            reject(error);
          }
        },
        onerror: (error) =>  {console.log(error);reject(error)}
      });
    });
  },
  
  /**
   * Create styled element
   * @param {string} tag - HTML tag
   * @param {Object} styles - CSS styles
   * @param {Object} attributes - HTML attributes
   * @param {string|Node} content - Element content
   * @returns {HTMLElement} - Created element
   */
  createElement: (tag, styles = {}, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    
    // Apply styles
    Object.entries(styles).forEach(([property, value]) => {
      element.style[property] = value;
    });
    
    // Apply attributes
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
    
    // Add content
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (content instanceof Node) {
      element.appendChild(content);
    }
    
    return element;
  },
  
  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   * @param {number} duration - Duration in ms
   */
  showNotification: (message, type = 'info', duration = 3000) => {
    const colors = {
      success: COLORS.secondary,
      error: COLORS.danger,
      info: COLORS.primary
    };
    
    const notification = Utils.createElement('div', {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 16px',
      backgroundColor: colors[type],
      color: COLORS.text,
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: '10000',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      transform: 'translateY(100px)',
      opacity: '0',
      transition: 'transform 0.3s ease, opacity 0.3s ease'
    }, {}, message);
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
      notification.style.transform = 'translateY(100px)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
};

/**
 * UI Component class
 */
class Component {
  constructor() {
    this.element = null;
  }
  
  render() {
    throw new Error('Method not implemented');
  }
  
  mount(parent) {
    if (!this.element) {
      this.render();
    }
    parent.appendChild(this.element);
    return this;
  }
  
  unmount() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    return this;
  }
}

/**
 * Button component
 */
class Button extends Component {
  /**
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   * @param {string} variant - Button variant (primary, secondary, danger)
   */
  constructor(text, onClick, variant = 'primary') {
    super();
    this.text = text;
    this.onClick = onClick;
    this.variant = variant;
  }
  
  render() {
    const variantStyles = {
      primary: {
        backgroundColor: COLORS.primary,
        hoverBackgroundColor: COLORS.primaryHover
      },
      secondary: {
        backgroundColor: COLORS.secondary,
        hoverBackgroundColor: COLORS.secondaryHover
      },
      danger: {
        backgroundColor: COLORS.danger,
        hoverBackgroundColor: COLORS.dangerHover
      }
    };
    
    const variant = variantStyles[this.variant] || variantStyles.primary;
    
    this.element = Utils.createElement('button', {
      padding: '8px 16px',
      margin: '8px',
      borderRadius: '6px',
      backgroundColor: variant.backgroundColor,
      color: COLORS.text,
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease'
    }, {}, this.text);
    
    // Hover effect
    this.element.addEventListener('mouseover', () => {
      this.element.style.backgroundColor = variant.hoverBackgroundColor;
    });
    
    this.element.addEventListener('mouseout', () => {
      this.element.style.backgroundColor = variant.backgroundColor;
    });
    
    // Click handler
    this.element.addEventListener('click', this.onClick);
    
    return this.element;
  }
}

/**
 * Modal component
 */
class Modal extends Component {
  /**
   * @param {string} title - Modal title
   * @param {string|Node} content - Modal content
   * @param {Array<Button>} buttons - Modal buttons
   */
  constructor(title, content, buttons = []) {
    super();
    this.title = title;
    this.content = content;
    this.buttons = buttons;
    this.onClose = null;
    this.isDragging = false;
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;
  }
  
  static activeModals = [];

  render() {
    // Create overlay
    this.overlay = Utils.createElement('div', {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: '9999',
      backdropFilter: 'blur(4px)',
      transition: 'opacity 0.2s ease-in-out'
    });
    
    // Create modal container
    this.element = Utils.createElement('div', {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: COLORS.surface,
      borderRadius: '8px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
      maxWidth: '90%',
      maxHeight: '90%',
      width: 'auto',
      'z-index': 999,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: COLORS.text,
      opacity: '0',
      transition: 'transform 0.2s ease, opacity 0.2s ease',
      cursor: 'default'
    });

    // Trigger animation after mount
    requestAnimationFrame(() => {
      this.element.style.opacity = '1';
    });
    
    // Create header
    const header = Utils.createElement('div', {
      padding: '16px',
      borderBottom: `1px solid ${COLORS.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'move',
      userSelect: 'none'
    });

    // Add drag functionality
    header.addEventListener('mousedown', (e) => {
      if (e.target === closeButton) return; // Prevent dragging when clicking close button
      this.isDragging = true;
      this.element.style.transition = 'none';
      
      const rect = this.element.getBoundingClientRect();
      this.offsetX = e.clientX - rect.left;
      this.offsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        e.preventDefault();
        
        // Calculate new position based on mouse position and initial offset
        let newX = e.clientX - this.offsetX;
        let newY = e.clientY - this.offsetY;
        
        // Keep modal within viewport bounds
        const rect = this.element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        newX = Math.max(0, Math.min(newX, viewportWidth - rect.width));
        newY = Math.max(0, Math.min(newY, viewportHeight - rect.height));
        
        this.element.style.left = `${newX}px`;
        this.element.style.top = `${newY}px`;
        this.element.style.transform = 'none';
      }
    });

    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.element.style.transition = 'left 0.2s ease, top 0.2s ease';
    });
    
    // Create title
    const title = Utils.createElement('h2', {
      margin: '0',
      fontSize: '18px',
      fontWeight: '600'
    }, {}, this.title);
    
    // Create close button
    const closeButton = Utils.createElement('button', {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: COLORS.textSecondary,
      fontSize: '20px',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease'
    }, {}, '×');
    
    closeButton.addEventListener('mouseover', () => {
      closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    closeButton.addEventListener('mouseout', () => {
      closeButton.style.backgroundColor = 'transparent';
    });
    
    closeButton.addEventListener('click', () => this.close());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create content
    const contentContainer = Utils.createElement('div', {
      padding: '16px',
      overflowY: 'auto',
      maxHeight: 'calc(80vh - 120px)' // Adjust for header and footer
    });
    
    if (typeof this.content === 'string') {
      const contentElement = Utils.createElement('p', {
        margin: '0',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }, {}, this.content);
      contentContainer.appendChild(contentElement);
    } else if (this.content instanceof Node) {
      contentContainer.appendChild(this.content);
    }
    
    // Create footer
    const footer = Utils.createElement('div', {
      padding: '16px',
      borderTop: `1px solid ${COLORS.border}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px'
    });
    
    // Add buttons to footer
    this.buttons.forEach(button => button.mount(footer));
    
    // Assemble modal
    this.element.appendChild(header);
    this.element.appendChild(contentContainer);
    this.element.appendChild(footer);
    
    // Add modal to overlay
    this.overlay.appendChild(this.element);
    
    return this.overlay;
  }
  
  /**
   * Set close handler
   * @param {Function} handler - Close handler
   */
  setOnClose(handler) {
    this.onClose = handler;
    return this;
  }
  
  /**
   * Close modal
   */
  close() {
    if (this.onClose) {
      this.onClose();
    }
    // Remove this modal from active modals
    const index = Modal.activeModals.indexOf(this);
    if (index > -1) {
      Modal.activeModals.splice(index, 1);
    }
    // Close all modals if this is the last one
    if (Modal.activeModals.length === 0) {
      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.remove();
      });
    }
    this.unmount();
  }
  
  /**
   * Mount modal to document body
   */
  show() {
    // Ensure overlay is initialized by calling render if needed
    if (!this.overlay) {
      this.render();
    }
    
    // Add this modal to active modals
    Modal.activeModals.push(this);
    
    // Add class and mount to document body
    if (this.overlay && this.overlay.classList) {
      this.overlay.classList.add('modal-overlay');
      this.mount(document.body);
    } else {
      console.error('Modal overlay element not properly initialized');
    }
    
    return this;
  }
}

/**
 * Floating action button component
 */
class FloatingActionButton extends Component {
  /**
   * @param {Function} onClick - Click handler
   */
  constructor(onClick) {
    super();
    this.onClick = onClick;
  }
  
  render() {
    this.element = Utils.createElement('button', {
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: COLORS.primary,
      color: COLORS.text,
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.2s ease, background-color 0.2s ease'
    })
    
    // Add question mark icon
    const questionMarkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    this.element.innerHTML = questionMarkSvg;
    
    // Hover effect
    this.element.addEventListener('mouseover', () => {
      this.element.style.backgroundColor = COLORS.primaryHover;
      this.element.style.transform = 'translateX(-50%) scale(1.05)';
    });
    
    this.element.addEventListener('mouseout', () => {
      this.element.style.backgroundColor = COLORS.primary;
      this.element.style.transform = 'translateX(-50%) scale(1)';
    });
    
    // Click handler
    this.element.addEventListener('click', this.onClick);
    
    return this.element;
  }
}

/**
 * TlemHelper class - Main application class
 */
class TlemHelper {
  constructor() {
    this.initialized = false;
    this.lessonType = null;
  }
  
  /**
   * Initialize the helper
   */
  init() {
    if (this.initialized) return;
    
    // Add floating action button
    this.fab = new FloatingActionButton(() => this.handleFabClick());
    this.fab.mount(document.body);
    
    // Add event listeners
    this.addEventListeners();
    
    this.initialized = true;
    Utils.showNotification('Tlem Helper v3 initialized', 'info');
  }
  
  /**
   * Add event listeners
   */
  addEventListeners() {
    // Listen for lesson navigation
    const nextButton = document.getElementById('lekcja_next');
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        // Wait for new lesson to load
        setTimeout(() => this.detectLessonType(), 1000);
      });
    }
  }
  
  /**
   * Handle floating action button click
   */
  handleFabClick() {
    this.detectLessonType();
    this.processCurrentLesson();
  }
  
  /**
   * Detect current lesson type
   */
  detectLessonType() {
    return new Promise((resolve) => {
      const activeLesson = document.querySelectorAll('#lekcja-items > *.active');
      const lessonTypes = [];
      
      activeLesson.forEach((element) => {
        const lessonType = element.id.split('-')[1].slice('t_'.length);
        lessonTypes.push(lessonType);
      });
      
      this.lessonType = lessonTypes[0] || null;
      resolve(this.lessonType);
    });
  }
  
  /**
   * Process current lesson based on its type
   */
  async processCurrentLesson() {
    if (!this.lessonType) {
      await this.detectLessonType();
    }
    
    switch (this.lessonType) {
      case 'wiki':
        Utils.showNotification('Wiki lessons are not supported yet', 'info');
        break;
      case 'quiz':
        this.handleQuiz();
        break;
      case 'code':
        this.handleCode();
        break;
      case 'video':
        Utils.showNotification('Video lessons are not supported yet', 'info');
        break;
      case 'sql':
        this.handleSQL();
        break;
      default:
        Utils.showNotification('Unknown lesson type', 'error');
        break;
    }
  }
  
  /**
   * Get exercise text from the lesson
   * @returns {string} - Exercise text
   */
  getExerciseText() {
    const exerciseElements = document.getElementById('lekcja-t_tresc').querySelectorAll('div');
    let exerciseText = '';
    
    exerciseElements.forEach((element) => {
      if (element.textContent.includes('Zadanie:')) {
        exerciseText = element.textContent;
      } else if (element.style.cssText === 'background: rgb(238, 221, 221); border: 1px solid rgb(204, 170, 170); padding: 5px 10px;') {
        exerciseText = element.textContent;
      }
    });
    
    return exerciseText;
  }
  
  /**
   * Get source code from the lesson
   * @returns {Array} - Array of file data objects
   */
  getSourceCode() {
    const fileData = [];
    
    document.querySelectorAll('[id^="tab_file_"]').forEach((element) => {
      document.querySelector(`[href='#${element.id}']`).click();
      
      const codeLayer = document.querySelector(`#${element.id}`).querySelector('.ace_layer.ace_text-layer');
      const fileName = element.id;
      let fileContent = '';
      
      if (codeLayer) {
        const codeLines = codeLayer.querySelectorAll('.ace_line');
        for (const line of codeLines) {
          fileContent += line.textContent + '\n';
        }
      }
      
      fileData.push({ fileName, fileContent });
    });
    
    return fileData;
  }
  
  /**
   * Create prompt content for AI
   * @returns {string} - Prompt content
   */
  createPromptContent() {
    const exerciseText = this.getExerciseText();
    let promptContent = `W poniższym cytacie otrzymasz zadanie. Masz odpowiadać samymy gotowym kodem. \n"${exerciseText}"`;
    
    const sourceCodeFiles = this.getSourceCode();
    sourceCodeFiles.forEach((file) => {
      promptContent += `\n\`\`\`${file.fileName}\n${file.fileContent}\`\`\``;
    });
    
    return promptContent;
  }
  
  /**
   * Handle quiz lesson
   */
  async handleQuiz() {
    try {
      const quizData = this.getQuizData();
      const lessonID = Utils.getLessonID();
      
      // Show loading notification
      Utils.showNotification('Loading quiz data...', 'info');
      
      // Fetch quiz data from API
      const response = await Utils.apiRequest(`/quiz/${lessonID}`);
      
      if (response === 'No data') {
        Utils.showNotification('No quiz data found in database', 'error');
        return;
      }
      
      const parsedData = JSON.parse(response);
      
      // Process quiz data
      quizData.forEach((questionItem) => {
        parsedData.question.forEach((dbQuestion) => {
          const questionNoSpaces = questionItem.questionContent.replace(/\s/g, '');
          const dbQuestionNoSpaces = dbQuestion.question.replace(/\s/g, '');
          
          if (questionNoSpaces === dbQuestionNoSpaces) {
            const questionsAnswersDOM = document.querySelector(`[questiongroupid="${questionItem.questiongroupid}"]`);
            const answers = questionsAnswersDOM.querySelectorAll('label');
            
            answers.forEach((answer) => {
              const answerContent = answer.querySelector('p').textContent;
              const answerNoSpaces = answerContent.replace(/\s/g, '');
              const dbAnswerNoSpaces = dbQuestion.answer.replace(/\s/g, '');
              
              if (answerNoSpaces === dbAnswerNoSpaces) {
                answer.querySelector('input').click();
              } else if (dbQuestion.answer.includes('<next>')) {
                const answersList = dbQuestion.answer.split('<next>');
                const processedAnswers = answersList.map(a => a.replace(/\s/g, '').replace('<next>', ''));
                
                processedAnswers.forEach((answerText) => {
                  if (answerText === answerNoSpaces) {
                    answer.querySelector('input').click();
                  }
                });
              }
            });
          }
        });
      });
      
      Utils.showNotification('Quiz answers applied', 'success');
    } catch (error) {
      Utils.showNotification(`Error handling quiz: ${error.message}`, 'error');
      console.log(error);
    }
  }
  
  /**
   * Get quiz data from the page
   * @returns {Array} - Array of quiz question objects
   */
  getQuizData() {
    const questions = document.getElementById('quiz_content').querySelectorAll('.note');
    const quizData = [];
    
    questions.forEach((question) => {
      let questionContent = question.querySelector('.block').textContent;
      // Remove the question number
      questionContent = questionContent.slice(questionContent.indexOf('.') + 1);
      
      const questiongroupid = question.getAttribute('questiongroupid');
      const answers = question.querySelectorAll('.radio-list > label');
      const answersContent = [];
      
      answers.forEach((answer) => {
        const answerContent = answer.querySelector('p').textContent;
        answersContent.push(answerContent);
      });
      
      quizData.push({ 
        questionContent, 
        questiongroupid, 
        answersContent 
      });
    });
    
    return quizData;
  }
  
  /**
   * Handle code lesson
   */
  handleCode() {
    try {
      const promptContent = this.createPromptContent();
      
      // Create buttons for the modal
      const copyButton = new Button('Copy', (event) => {
        Utils.copyToClipboard(promptContent)
          .then(() => {
            Utils.showNotification('Copied to clipboard', 'success');
            event.target.textContent = 'Copied!';
            setTimeout(() => {
              event.target.textContent = 'Copy';
            }, 2000);
          })
          .catch(() => {
            Utils.showNotification('Failed to copy to clipboard', 'error');
          });
      });
      
      const checkDatabaseButton = new Button('Check Database', async () => {
        try {
          const lessonID = Utils.getLessonID();
          const response = await Utils.apiRequest(`/getLesson/?id=${lessonID}`);
          
          if (response === 'No data for this lesson') {
            Utils.showNotification('No data found in database', 'error');
            return;
          }
          
          const data = JSON.parse(response);
          
          // Create content element for solutions
          const solutionsElement = document.createElement('div');
          
          for (const key in data) {
            const solutionContainer = Utils.createElement('div', {
              margin: '10px 0',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '6px',
              overflow: 'hidden'
            });
            
            const solutionHeader = Utils.createElement('div', {
              backgroundColor: COLORS.primary,
              color: COLORS.text,
              padding: '10px',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }, {}, key);
            
            const solutionContent = Utils.createElement('pre', {
              margin: '0',
              padding: '10px',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              overflowX: 'auto',
              fontFamily: 'monospace'
            }, {}, data[key].replace(/\\n/g, '\n'));
            
            const copyButton = Utils.createElement('button', {
              backgroundColor: 'transparent',
              border: 'none',
              color: COLORS.text,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px'
            }, {}, 'Copy');
            
            copyButton.addEventListener('click', () => {
              Utils.copyToClipboard(data[key].replace(/\\n/g, '\n'));
              Utils.showNotification('Solution copied to clipboard', 'success');
            });
            
            solutionHeader.appendChild(copyButton);
            solutionContainer.appendChild(solutionHeader);
            solutionContainer.appendChild(solutionContent);
            solutionsElement.appendChild(solutionContainer);
          }
          
          // Show solutions in a new modal
          const solutionsModal = new Modal(
            'Solutions from Database',
            solutionsElement,
            [new Button('Close', () => solutionsModal.close(), 'secondary')]
          );
          
          solutionsModal.show();
        } catch (error) {
          Utils.showNotification(`Error fetching data: ${error.message}`, 'error');
        }
      }, 'secondary');
      
      // Create and show modal
      const modal = new Modal(
        'AI Prompt',
        promptContent,
        [copyButton, checkDatabaseButton]
      );
      
      modal.show();
    } catch (error) {
      Utils.showNotification(`Error handling code: ${error.message}`, 'error');
      console.log(error)
    }
  }
  
  /**
   * Handle SQL lesson
   */
  handleSQL() {
    try {
      const promptContent = this.createPromptContent();
      
      // Create buttons for the modal
      const copyButton = new Button('Copy', (event) => {
        Utils.copyToClipboard(promptContent)
          .then(() => {
            Utils.showNotification('Copied to clipboard', 'success');
            event.target.textContent = 'Copied!';
            setTimeout(() => {
              event.target.textContent = 'Copy';
            }, 2000);
          })
          .catch(() => {
            Utils.showNotification('Failed to copy to clipboard', 'error');
          });
      });
      
      const checkDatabaseButton = new Button('Check Database', async () => {
        try {
          const lessonID = Utils.getLessonID();
          const response = await Utils.apiRequest(`/getLesson/?id=${lessonID}`);
          
          if (response === 'No data for this lesson') {
            Utils.showNotification('No data found in database', 'error');
            return;
          }
          
          const data = JSON.parse(response);
          
          // Get first solution and insert it into SQL editor
          for (const key in data) {
            const sqlCode = data[key].replace(/\\n/g, '\n');
            this.insertCodeSQL(sqlCode);
            Utils.showNotification('SQL code inserted from database', 'success');
            break; // Just use the first solution
          }
        } catch (error) {
          Utils.showNotification(`Error fetching data: ${error.message}`, 'error');
        }
      },
      'secondary');
      
      // Create and show modal
      const modal = new Modal(
        'SQL Prompt',
        promptContent,
        [copyButton, checkDatabaseButton]
      );
      
      modal.show();
    } catch (error) {
      Utils.showNotification(`Error handling SQL: ${error.message}`, 'error');
    }
  }
  
  /**
   * Insert SQL code into editor
   * @param {string} code - SQL code to insert
   * @param {Function} callback - Optional callback function
   */
  insertCodeSQL(code, callback) {
    try {
      // Access the SQL editor and insert code
      ace.edit('sql_cmd').setValue(code);
      ace.edit('sql_cmd').clearSelection();
      
      // Execute SQL
      if (typeof handlers !== 'undefined' && handlers.sql && handlers.sql.process) {
        handlers.sql.process();
      } else {
        Utils.showNotification('Could not execute SQL automatically', 'error');
      }
      
      // Call callback if provided
      if (callback) {
        callback();
      }
    } catch (error) {
      Utils.showNotification(`Error inserting SQL code: ${error.message}`, 'error');
    }
  }
}

// Initialize the helper when the page is ready
(function() {
  'use strict';
  
  // Wait for key elements to be available
  waitForKeyElements('#lekcja-t_wiki', () => {
    const tlemHelper = new TlemHelper();
    tlemHelper.init();
  }, true);
})();