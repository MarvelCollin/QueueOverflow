describe('Detailed Question and Answer Flow', () => {
  const questionTitle = `Test Question ${Date.now()}`;
  const questionContent = 'This is a detailed test question created by Cypress. How do I test React applications with TypeScript?';
  const answerContent = 'To test React applications with TypeScript using Cypress, you need to follow these steps:\n\n1. Install Cypress with `npm install cypress --save-dev`\n2. Configure TypeScript support\n3. Write your tests\n4. Run the tests';
  const tags = 'react,typescript,testing';

  beforeEach(() => {

    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('should create, view, answer, and interact with a question using local storage', () => {

    cy.visit('/login');
    cy.get('input[type="email"]').type('john@example.com');
    cy.get('input[type="password"]').type('password');
    cy.get('input[type="checkbox"]').check(); 
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/questions');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('currentUser')).to.not.be.null;
      expect(win.localStorage.getItem('token')).to.not.be.null;
      const user = JSON.parse(win.localStorage.getItem('currentUser') || '{}');
      expect(user.email).to.equal('john@example.com');
    });

    cy.contains('button', 'Ask Question').click();
    cy.url().should('include', '/ask-question');

    cy.get('input[placeholder*="title"]').type(questionTitle);
    cy.get('textarea[placeholder*="question"]').type(questionContent);
    cy.get('input[placeholder*="tags"]').type(tags);
    cy.contains('button', 'Post Question').click();

    cy.contains('Question posted successfully').should('be.visible');

    cy.url().should('include', '/question/');

    cy.contains(questionTitle).should('be.visible');
    cy.contains(questionContent).should('be.visible');

    tags.split(',').forEach(tag => {
      cy.contains(tag.trim()).should('be.visible');
    });

    let questionId;
    cy.url().then(url => {
      questionId = url.split('/').pop();
    });

    cy.window().then((win) => {
      const storedQuestions = JSON.parse(win.localStorage.getItem('stackoverflow_questions') || '[]');
      const matchingQuestion = storedQuestions.find((q: any) => q.title === questionTitle);
      expect(matchingQuestion).to.not.be.undefined;
      expect(matchingQuestion.content).to.include(questionContent);
    });

    cy.get('textarea[placeholder*="answer"]').type(answerContent);
    cy.contains('button', 'Post Answer').click();

    cy.contains('Answer posted successfully').should('be.visible');

    cy.contains(answerContent.split('\n')[0]).should('be.visible');

    cy.window().then((win) => {
      const storedAnswers = JSON.parse(win.localStorage.getItem('stackoverflow_answers') || '[]');
      const questionAnswers = storedAnswers.filter((a: any) => a.question_id.toString() === questionId);
      expect(questionAnswers.length).to.be.at.least(1);

      const matchingAnswer = questionAnswers.find((a: any) => a.content.includes(answerContent.split('\n')[0]));
      expect(matchingAnswer).to.not.be.undefined;
    });

    cy.get('.answer-container').first().within(() => {
      cy.get('button[aria-label="Upvote"]').click();
    });

    cy.get('.answer-container').first().within(() => {
      cy.contains('1').should('be.visible');
    });

    cy.window().then((win) => {
      const storedVotes = JSON.parse(win.localStorage.getItem('stackoverflow_votes') || '[]');
      const answerVotes = storedVotes.filter((v: any) => v.parent_id.toString() === questionId && v.type === 'answer');
      expect(answerVotes.length).to.be.at.least(1);
    });

    cy.get('.answer-container').first().within(() => {
      cy.get('button[aria-label="Accept answer"]').click();
    });

    cy.get('.answer-container').first().within(() => {
      cy.get('.accepted-answer').should('exist');
    });

    cy.contains('Solved').should('be.visible');

    cy.window().then((win) => {
      const storedQuestions = JSON.parse(win.localStorage.getItem('stackoverflow_questions') || '[]');
      const matchingQuestion = storedQuestions.find((q: any) => q.id.toString() === questionId);
      expect(matchingQuestion.is_answered).to.equal(1);
    });

    cy.contains('Questions').click();
    cy.url().should('include', '/questions');

    cy.contains(questionTitle).should('be.visible');

    cy.contains(questionTitle).parents('.question-card').within(() => {
      cy.contains('Solved').should('be.visible');
    });
  });
});