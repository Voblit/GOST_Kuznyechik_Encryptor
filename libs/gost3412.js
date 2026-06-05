/*
ehh...
i suppose it kinda works ‾\_(• _ •)_/‾
other than that... yeahhh...
anyways made by yaboy voblit
not sure how accurate it is :\
made in 2026
ver... 7
*/

const GostKuznyechik = (function() {
    'use strict';

    // GOST R 34.12-2015 Non-linear S-Box transformation
    const S = new Uint8Array([
        0xFC, 0xEE, 0xDD, 0x11, 0xCF, 0x6E, 0x31, 0x16, 0xFB, 0xC7, 0xFA, 0xB7, 0x43, 0x4E, 0x9A, 0x07,
        0x10, 0x52, 0x33, 0x69, 0x64, 0xBC, 0xA2, 0x9F, 0x58, 0x6A, 0x8B, 0xDE, 0x3A, 0xA1, 0x66, 0x41,
        0x61, 0x45, 0x51, 0x39, 0x8D, 0xAC, 0xDC, 0x7F, 0x15, 0x32, 0x4B, 0x93, 0x2A, 0x40, 0x81, 0x56,
        0xDF, 0x21, 0x8E, 0x43, 0x62, 0x1A, 0xC1, 0xA9, 0x3F, 0x14, 0xEE, 0xEA, 0xD4, 0x6F, 0x98, 0x49,
        0x19, 0x24, 0xD2, 0xB6, 0x60, 0x2D, 0xB9, 0xDE, 0x5B, 0x4D, 0x85, 0xC7, 0x8A, 0x4E, 0x9A, 0x5B,
        0x2B, 0xC5, 0xD9, 0x6B, 0xAA, 0x42, 0x25, 0xC4, 0x24, 0xB1, 0xD7, 0x76, 0x59, 0x2E, 0x6E, 0x48,
        0xC5, 0xB8, 0x6A, 0x12, 0x4B, 0xA5, 0x7F, 0x33, 0x8F, 0x97, 0xD7, 0x1B, 0xB1, 0x11, 0x2B, 0xCC,
        0x2F, 0xB4, 0x97, 0x82, 0x1B, 0x93, 0x80, 0x1C, 0x83, 0x70, 0x0D, 0xA6, 0xD0, 0x89, 0x34, 0x85,
        0x50, 0x3D, 0xC3, 0x05, 0x1F, 0x31, 0xD9, 0x8B, 0x79, 0xFA, 0x9F, 0x6F, 0x88, 0x9E, 0x9B, 0x21,
        0xB2, 0x98, 0x86, 0x76, 0x3C, 0xC6, 0x68, 0x6C, 0x0A, 0x54, 0x72, 0x68, 0x11, 0x27, 0x74, 0x67,
        0xD5, 0x53, 0xD2, 0x47, 0xC1, 0xAB, 0x20, 0x70, 0x2D, 0x80, 0x77, 0xDF, 0xFD, 0x3A, 0x24, 0x2A,
        0x80, 0x21, 0xB8, 0x5B, 0xDF, 0x8A, 0x1E, 0x11, 0x15, 0x3B, 0x9A, 0xFB, 0x85, 0x82, 0x69, 0x0F,
        0x1B, 0xC0, 0xED, 0xE7, 0x3B, 0xD4, 0x96, 0xEE, 0xA6, 0xF9, 0xC7, 0x4F, 0xD3, 0x64, 0xDF, 0x03,
        0x4C, 0xD4, 0x2D, 0xAE, 0x46, 0x96, 0x8C, 0xAB, 0xBC, 0x5A, 0xA1, 0x01, 0x48, 0xA2, 0xE0, 0x12,
        0x8D, 0xCC, 0x71, 0xBE, 0x00, 0xF2, 0x62, 0x1C, 0xC4, 0xCE, 0x9E, 0xD5, 0x8A, 0x48, 0x04, 0xBF,
        0xCD, 0x44, 0xEC, 0x6B, 0x2C, 0x61, 0x0F, 0xB6, 0x8A, 0x84, 0x02, 0x0E, 0xC7, 0x74, 0x21, 0xCD
    ]);

    const INV_S = new Uint8Array(256);
    for (let i = 0; i < 256; i++) { INV_S[S[i]] = i; }

    // Primitive polynomial: x^8 + x^7 + x^6 + x^1 + 1 (0xC3)
    const L_COEFFS = [148, 32, 133, 16, 194, 192, 1, 251, 1, 192, 194, 16, 133, 32, 148, 1];

    function gfMul(a, b) {
        let p = 0;
        for (let i = 0; i < 8; i++) {
            if (b & 1) p ^= a;
            let hiBitSet = a & 0x80;
            a <<= 1;
            if (hiBitSet) a ^= 0xC3;
            b >>= 1;
        }
        return p & 0xFF;
    }

    function applyR(block) {
        let acc = 0;
        for (let i = 0; i < 16; i++) {
            acc ^= gfMul(block[i], L_COEFFS[i]);
        }
        let nextState = new Uint8Array(16);
        nextState.set(block.subarray(1, 16), 0);
        nextState[15] = acc;
        return nextState;
    }

    function applyL(block) {
        let state = new Uint8Array(block);
        for (let i = 0; i < 16; i++) { state = applyR(state); }
        return state;
    }

    function applyInvR(block) {
        let acc = block[15];
        let nextState = new Uint8Array(16);
        nextState.set(block.subarray(0, 15), 1);
        
        for (let i = 0; i < 15; i++) {
            acc ^= gfMul(nextState[i + 1], L_COEFFS[i]);
        }
        nextState[0] = acc;
        return nextState;
    }

    function applyInvL(block) {
        let state = new Uint8Array(block);
        for (let i = 0; i < 16; i++) { state = applyInvR(state); }
        return state;
    }

    function getRoundConstants() {
        const constants = [];
        for (let i = 1; i <= 32; i++) {
            let c = new Uint8Array(16);
            c[0] = i; 
            constants.push(applyL(c));
        }
        return constants;
    }

    const R_CONSTANTS = getRoundConstants();

    function expandKey(key) {
        if (key.length !== 32) throw new Error("Invalid key length.");
        const roundKeys = [];
        let k1 = key.slice(0, 16);
        let k2 = key.slice(16, 32);
        
        roundKeys.push(k1.slice());
        roundKeys.push(k2.slice());

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 8; j++) {
                let cIdx = i * 8 + j;
                let state = new Uint8Array(16);
                
                for (let k = 0; k < 16; k++) { state[k] = k1[k] ^ R_CONSTANTS[cIdx][k]; }
                for (let k = 0; k < 16; k++) { state[k] = S[state[k]]; }
                state = applyL(state);
                for (let k = 0; k < 16; k++) { state[k] ^= k2[k]; }
                
                k2 = k1.slice();
                k1 = state.slice();
            }
            roundKeys.push(k1.slice());
            roundKeys.push(k2.slice());
        }
        return roundKeys;
    }

    return {
        encryptCBC: function(plaintext, key, iv) {
            if (iv.length !== 16) throw new Error("Invalid IV length.");
            
            const padByte = 16 - (plaintext.length % 16);
            const paddedLength = plaintext.length + padByte;
            const padded = new Uint8Array(paddedLength);
            padded.set(plaintext);
            padded.fill(padByte, plaintext.length);

            const roundKeys = expandKey(key);
            const ciphertext = new Uint8Array(paddedLength);
            let currentVector = new Uint8Array(iv);

            for (let offset = 0; offset < paddedLength; offset += 16) {
                let block = padded.subarray(offset, offset + 16);
                let state = new Uint8Array(16);
                for (let i = 0; i < 16; i++) { state[i] = block[i] ^ currentVector[i]; }

                for (let round = 0; round < 9; round++) {
                    for (let i = 0; i < 16; i++) { state[i] ^= roundKeys[round][i]; }
                    for (let i = 0; i < 16; i++) { state[i] = S[state[i]]; }
                    state = applyL(state);
                }
                for (let i = 0; i < 16; i++) { state[i] ^= roundKeys[9][i]; }
                
                ciphertext.set(state, offset);
                currentVector = state;
            }
            return ciphertext;
        },

        decryptCBC: function(ciphertext, key, iv) {
            if (iv.length !== 16) throw new Error("Invalid IV length.");
            if (ciphertext.length % 16 !== 0 || ciphertext.length === 0) throw new Error("Invalid ciphertext.");

            const length = ciphertext.length;
            const plaintext = new Uint8Array(length);
            const roundKeys = expandKey(key);
            let currentVector = new Uint8Array(iv);

            for (let offset = 0; offset < length; offset += 16) {
                let block = ciphertext.subarray(offset, offset + 16);
                let state = new Uint8Array(block);

                for (let i = 0; i < 16; i++) { state[i] ^= roundKeys[9][i]; }

                for (let round = 8; round >= 0; round--) {
                    state = applyInvL(state);
                    for (let i = 0; i < 16; i++) { state[i] = INV_S[state[i]]; }
                    for (let i = 0; i < 16; i++) { state[i] ^= roundKeys[round][i]; }
                }

                let decryptedBlock = new Uint8Array(16);
                for (let i = 0; i < 16; i++) { decryptedBlock[i] = state[i] ^ currentVector[i]; }
                plaintext.set(decryptedBlock, offset);
                currentVector = block;
            }

            const padByte = plaintext[length - 1];
            if (padByte < 1 || padByte > 16) throw new Error("Decryption Error: Invalid padding.");

            let badPadding = 0;
            for (let i = length - padByte; i < length; i++) {
                badPadding |= (plaintext[i] ^ padByte);
            }
            if (badPadding !== 0) throw new Error("Decryption Error: Invalid padding.");
            
            return plaintext.slice(0, length - padByte);
        }
    };
})();

if (typeof window !== 'undefined') {
    window.GostKuznyechik = GostKuznyechik;
}
