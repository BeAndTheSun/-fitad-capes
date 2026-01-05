// Apparently react-email requires a global TextEncoder and TextDecoder to be defined in the global scope. This is a workaround to make it work with Jest.
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@testing-library/jest-dom';

import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
