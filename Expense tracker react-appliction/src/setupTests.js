// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress specific React Router future-flag warnings during tests
const _originalConsoleWarnSetup = console.warn;
console.warn = (...args) => {
	const msg = args[0] || '';
	if (typeof msg === 'string' && (msg.includes('v7_startTransition') || msg.includes('v7_relativeSplatPath'))) {
		return;
	}
	_originalConsoleWarnSetup(...args);
};
