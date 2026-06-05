/*
ehh...
i suppose it kinda works ‾\_(• _ •)_/‾
other than that... yeahhh...
anyways made by yaboy voblit
not sure how accurate it is :\
made in 2026
ver 2
*/
(function(window) {
    'use strict';

    const S = new Uint8Array([
        0xFC, 0xEE, 0xDD, 0x11, 0xCF, 0x6E, 0x31, 0x16, 0xFB, 0xC7, 0xFA, 0xB7, 0x43, 0x4E, 0x9A, 0x31,
        0x39, 0x52, 0x33, 0x69, 0x64, 0xBC, 0xA2, 0x9F, 0x58, 0x6A, 0x8B, 0xDE, 0x30, 0x22, 0x4A, 0x1F,
        0xAA, 0x18, 0x94, 0x3A, 0x12, 0x6C, 0x41, 0x7E, 0x05, 0xDA, 0x5A, 0xDF, 0x3B, 0xB8, 0x47, 0xF2,
        0x09, 0x49, 0x86, 0xC1, 0xA4, 0x42, 0x83, 0xA0, 0x3F, 0x91, 0x46, 0x61, 0x2C, 0xB1, 0x9E, 0xE1,
        0x4C, 0x45, 0x92, 0x48, 0x24, 0x3D, 0x7D, 0x13, 0x60, 0x4B, 0xBB, 0xD4, 0x81, 0xD7, 0xCB, 0x7F,
        0x8A, 0x10, 0x0D, 0x5E, 0x23, 0x19, 0x5C, 0x3E, 0x53, 0x97, 0x0C, 0xA1, 0x9C, 0xB4, 0x90, 0x96,
        0xEE, 0x2D, 0x44, 0x36, 0xB0, 0x28, 0xAF, 0xA5, 0x51, 0x29, 0x4D, 0x2B, 0x98, 0x25, 0x1A, 0x9D,
        0x04, 0x21, 0x2E, 0x1D, 0xB5, 0x3C, 0x95, 0xBA, 0x2E, 0x80, 0x82, 0x1E, 0x00, 0x20, 0x01, 0x6F,
        0x1B, 0x17, 0x26, 0x27, 0x6B, 0x35, 0x88, 0x2C, 0x59, 0x2A, 0x8E, 0x37, 0x50, 0xDF, 0x15, 0x34,
        0xA7, 0x56, 0xDC, 0x38, 0x0A, 0x7A, 0x85, 0x32, 0x0E, 0xA6, 0x54, 0x93, 0x55, 0x1C, 0x57, 0x74,
        0x14, 0xEB, 0xEE, 0x8F, 0x40, 0x06, 0xBC, 0x1A, 0x2F, 0x1D, 0x0E, 0x18, 0xAB, 0x84, 0x8A, 0x31,
        0x4F, 0x11, 0x2A, 0x16, 0x19, 0x42, 0x03, 0x0C, 0x67, 0x28, 0xED, 0x29, 0x0D, 0x3E, 0xB1, 0x50,
        0x32, 0x0A, 0xEA, 0x1E, 0x24, 0x03, 0x65, 0xF6, 0x48, 0x61, 0x07, 0x58, 0x59, 0x56, 0x09, 0x6E,
        0x2A, 0x91, 0x4F, 0xB1, 0x60, 0x2B, 0x11, 0xA7, 0x18, 0x9D, 0xE0, 0x12, 0x45, 0xE4, 0x0D, 0x52,
        0x88, 0x2B, 0x2A, 0x78, 0x1F, 0x11, 0x72, 0xE3, 0x19, 0x40, 0x4E, 0x0C, 0x1B, 0x53, 0x16, 0x3A,
        0xD0, 0x6F, 0xE4, 0x24, 0x6D, 0x7A, 0x1E, 0x12, 0x09, 0x19, 0x15, 0x0C, 0x82, 0xE1, 0xEF, 0x90
    ]);

    const INV_S = new Uint8Array(256);
    for (let i = 0; i < 256; i++) { INV_S[S[i]] = i; }

    const L_COEFFS = [148, 32, 133, 16, 194, 192, 1, 251, 1, 192, 194, 16, 133, 32, 148, 1];

    function gfMul(a, b) {
        let p = 0;
        for (let i = 0; i < 8; i++) {
            if (b & 1) p ^= a;
            let hi = a & 0x80;
            a <<= 1;
            if (hi) a ^= 0xC3;
            b >>= 1;
        }
        return p & 0xFF;
    }

    function applyL(block) {
        let state = new Uint8Array(block);
        for (let iter = 0; iter < 16; iter++) {
            let acc = 0;
            for (let i = 0; i < 16; i++) {
                acc ^= gfMul(state[i], L_COEFFS[i]);
            }
            let nextState = new Uint8Array(16);
            nextState.set(state.subarray(1));
            nextState[15] = acc;
            state = nextState;
        }
        return state;
    }

    function applyInvL(block) {
        let state = new Uint8Array(block);
        for (let iter = 0; iter < 16; iter++) {
            let acc = state[15];
            for (let i = 0; i < 15; i++) {
                acc ^= gfMul(state[i], L_COEFFS[i]);
            }
            let nextState = new Uint8Array(16);
            nextState[0] = acc;
            nextState.set(state.subarray(0, 15), 1);
            state = nextState;
        }
        return state;
    }

    window.GostKuznyechik = {
        encryptCBC: function(plaintext, key, iv) {
            const paddedLength = Math.ceil(plaintext.length / 16) * 16;
            const padded = new Uint8Array(paddedLength);
            padded.set(plaintext);
            const padByte = paddedLength - plaintext.length;
            for (let i = plaintext.length; i < paddedLength; i++) { padded[i] = padByte; }

            const ciphertext = new Uint8Array(paddedLength);
            let currentVector = new Uint8Array(iv);

            for (let offset = 0; offset < paddedLength; offset += 16) {
                let block = padded.subarray(offset, offset + 16);
                let state = new Uint8Array(16);
                for (let i = 0; i < 16; i++) { state[i] = block[i] ^ currentVector[i]; }

                for (let round = 0; round < 10; round++) {
                    for (let i = 0; i < 16; i++) {
                        state[i] = S[state[i] ^ key[(round * 16 + i) % key.length]];
                    }
                    state = applyL(state);
                }
                ciphertext.set(state, offset);
                currentVector = state;
            }
            return ciphertext;
        },

        decryptCBC: function(ciphertext, key, iv) {
            const length = ciphertext.length;
            const plaintext = new Uint8Array(length);
            let currentVector = new Uint8Array(iv);

            for (let offset = 0; offset < length; offset += 16) {
                let block = ciphertext.subarray(offset, offset + 16);
                let state = new Uint8Array(block);

                for (let round = 9; round >= 0; round--) {
                    state = applyInvL(state);
                    for (let i = 0; i < 16; i++) {
                        state[i] = INV_S[state[i]] ^ key[(round * 16 + i) % key.length];
                    }
                }

                for (let i = 0; i < 16; i++) { plaintext[offset + i] = state[i] ^ currentVector[i]; }
                currentVector = block;
            }

            const padByte = plaintext[length - 1];
            if (padByte > 0 && padByte <= 16) { return plaintext.subarray(0, length - padByte); }
            return plaintext;
        }
    };
})(window);
