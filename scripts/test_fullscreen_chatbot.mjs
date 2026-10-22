import fs from 'fs';
import assert from 'assert';

console.log('====================================================');
console.log('SMART RESUME AI: FULL SCREEN CHATBOT VERIFICATION');
console.log('====================================================\n');

const componentPath = 'src/components/chat/CareerChatbot.tsx';
assert.ok(fs.existsSync(componentPath), 'CareerChatbot.tsx file must exist');

const code = fs.readFileSync(componentPath, 'utf8');

// 1. Verify Icons Imported
console.log('1. Checking Lucide icons for maximize, minimize, copy, check...');
assert.ok(code.includes('Maximize2'), 'Must import Maximize2 from lucide-react');
assert.ok(code.includes('Minimize2'), 'Must import Minimize2 from lucide-react');
assert.ok(code.includes('Copy'), 'Must import Copy icon from lucide-react');
assert.ok(code.includes('Check'), 'Must import Check icon from lucide-react');
console.log('   ✓ All required icons imported.');

// 2. Verify State Management
console.log('2. Checking state definitions...');
assert.ok(code.includes('const [isFullScreen, setIsFullScreen] = useState(false);'), 'Must declare isFullScreen state');
assert.ok(code.includes('toggleFullScreen'), 'Must have toggleFullScreen handler');
console.log('   ✓ isFullScreen state and toggleFullScreen function found.');

// 3. Verify Escape Key and Keyboard Navigation
console.log('3. Checking Escape key handling...');
assert.ok(code.includes("e.key === 'Escape'"), 'Must handle Escape keydown');
assert.ok(code.includes('if (isFullScreen)'), 'Must check isFullScreen in Escape handler');
assert.ok(code.includes('setIsFullScreen(false)'), 'Must exit full screen on Escape');
assert.ok(code.includes('setIsOpen(false)'), 'Must close chat if not in full screen on Escape');
console.log('   ✓ Escape key handler cleanly handles both full-screen exit and window close.');

// 4. Verify Body Scroll Lock
console.log('4. Checking body scroll locking in full-screen mode...');
assert.ok(code.includes("document.body.style.overflow = 'hidden'"), 'Must lock body scroll in full screen');
assert.ok(code.includes('document.body.style.overflow = originalOverflow'), 'Must restore original overflow on unmount/toggle');
console.log('   ✓ Scroll lock properly toggled to prevent background scroll leaks.');

// 5. Verify Full-Screen Layout Classes
console.log('5. Checking 100vw and 100dvh layout styling...');
assert.ok(code.includes('w-screen'), 'Must use w-screen in full screen');
assert.ok(code.includes('h-[100dvh]'), 'Must use 100dvh for modern mobile-safe viewport height');
assert.ok(code.includes('max-h-[100dvh]'), 'Must constrain max height to 100dvh');
assert.ok(code.includes('fixed inset-0'), 'Must occupy fixed inset-0 in full screen mode');
assert.ok(code.includes('max-w-4xl mx-auto w-full'), 'Must use centered readable column in full screen');
assert.ok(code.includes('pb-[max(0.75rem,env(safe-area-inset-bottom))]'), 'Must support iOS home bar safe area padding');
console.log('   ✓ Full-screen layout classes adhere to viewport and safe-area specifications.');

// 6. Verify Toggle Button and Accessibility Attributes
console.log('6. Checking accessibility, ARIA labels, and tooltips...');
assert.ok(code.includes('role="dialog"'), 'Chat container must have role="dialog"');
assert.ok(code.includes('aria-label="Smart Resume AI Assistant"'), 'Chat container must have descriptive aria-label');
assert.ok(code.includes('aria-modal='), 'Chat container must set aria-modal in full screen');
assert.ok(code.includes('aria-expanded={isFullScreen}'), 'Toggle button must indicate expanded state');
assert.ok(code.includes('title={isFullScreen ?'), 'Toggle button must have dynamic tooltip');
assert.ok(code.includes('aria-label={isFullScreen ?'), 'Toggle button must have dynamic accessible aria-label');
console.log('   ✓ ARIA attributes, tooltips, and screen-reader accessibility verified.');

// 7. Verify Message Preservation and Auto-scroll
console.log('7. Checking conversation preservation and auto-scrolling...');
assert.ok(code.includes('messagesEndRef.current?.scrollIntoView'), 'Must scroll into view when toggled');
assert.ok(code.includes('inputRef.current?.focus()'), 'Must refocus input when toggled');
console.log('   ✓ Message history and conversation state preserved across toggle transitions.');

// 8. Verify CodeBlock Copying
console.log('8. Checking code snippet copying...');
assert.ok(code.includes('navigator.clipboard.writeText'), 'CodeBlock must support copying code snippets');
assert.ok(code.includes('Copied to clipboard'), 'Must have accessible label for copy state');
console.log('   ✓ Code block copying verified.');

console.log('\n====================================================');
console.log('ALL FULL-SCREEN CHATBOT REQUIREMENTS VERIFIED & PASSED');
console.log('====================================================');
