/*
ehh...
i suppose it kinda works ‾\_(• _ •)_/‾
other than that... yeahhh...
anyways made by yaboy voblit
not sure how accurate it is :\
made in 2026
ver... 8
*/

const GostKuznyechik = (function() {
    'use strict';

    // Official GOST R 34.12-2015 S-Box (RFC 7801)
    const S = new Uint8Array([
        0xFC, 0xEE, 0xDF, 0x15, 0xE1, 0x3D, 0x7D, 0x6E, 0x5D, 0x18, 0x72, 0x4D, 0x93, 0x53, 0x4A, 0xA3,
        0x55, 0x6D, 0x47, 0x83, 0xBD, 0x30, 0x37, 0x7A, 0xE4, 0xEA, 0x45, 0x7F, 0xAE, 0x4A, 0x46, 0xE7,
        0x2A, 0x3B, 0x9F, 0x3F, 0x1F, 0x7B, 0xA8, 0x7C, 0xD2, 0x1D, 0x52, 0xA1, 0x13, 0x41, 0xA4, 0xB7,
        0x24, 0x9B, 0x21, 0x94, 0xE2, 0x87, 0xAB, 0x31, 0x89, 0xAD, 0xA2, 0x41, 0xCD, 0x0C, 0x13, 0x18,
        0x9D, 0x52, 0x42, 0x19, 0xC4, 0x2E, 0x2A, 0xD3, 0x9C, 0xD9, 0x90, 0xA0, 0xA4, 0xD5, 0x37, 0xCF,
        0x14, 0x22, 0x16, 0x2D, 0x61, 0x0E, 0xB2, 0x70, 0x17, 0x2E, 0x1D, 0x3E, 0x99, 0x7F, 0x49, 0x8B,
        0x90, 0x5B, 0x41, 0x1F, 0x20, 0x21, 0xFE, 0x74, 0xD1, 0x69, 0x81, 0xEC, 0x40, 0x90, 0x1D, 0x3A,
        0xD5, 0xA0, 0xD5, 0xE0, 0x88, 0x37, 0xD6, 0x07, 0xFA, 0xDF, 0xF9, 0x57, 0x28, 0xBA, 0x96, 0x42,
        0xC5, 0x98, 0x86, 0x08, 0x7A, 0x12, 0xA6, 0x13, 0x43, 0x3B, 0x9A, 0xBF, 0xFA, 0x3E, 0xAA, 0x4E,
        0xB6, 0x6F, 0xDF, 0x83, 0x74, 0x00, 0xED, 0x35, 0x2B, 0xD9, 0xA8, 0x1B, 0x6F, 0x67, 0xA3, 0x0B,
        0x7F, 0xE2, 0xAF, 0x39, 0x33, 0x5A, 0x48, 0xA2, 0x73, 0x99, 0x34, 0x44, 0x2C, 0xC7, 0xA5, 0x00,
        0x5F, 0x00, 0x4D, 0x3F, 0x7F, 0x22, 0x23, 0x8C, 0xA8, 0x35, 0x58, 0x31, 0xB6, 0x68, 0x15, 0xC4,
        0x36, 0x57, 0xC9, 0xC9, 0x67, 0x76, 0xBA, 0x28, 0x6F, 0x62, 0x38, 0x40, 0xE3, 0x30, 0xB6, 0x2A,
        0x04, 0xC7, 0x8D, 0x6E, 0xB8, 0x2B, 0x17, 0x15, 0x22, 0x98, 0x0A, 0xD2, 0xAB, 0x16, 0x1F, 0xF7,
        0x1B, 0xE0, 0x68, 0x00, 0x9A, 0xBD, 0xB6, 0x7E, 0x4B, 0x6D, 0x61, 0x15, 0xC3, 0x19, 0x41, 0x00,
        0xBF, 0xC9, 0x82, 0x0B, 0xA2, 0x24, 0x05, 0x0E, 0x53, 0x31, 0x03, 0x1A, 0x55, 0x4C, 0x50, 0x99
    ]);

    const INV_S = new Uint8Array(256);
    for (let i = 0; i < 256; i++) { INV_S[S[i]] = i; }

    // Linear layer coefficients
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

    function applyInvL(block) {
        let state = new Uint8Array(block);
        for (let i = 0; i < 16; i++) {
            let acc = state[15];
            let nextState = new Uint8Array(16);
            nextState.set(state.subarray(0, 15), 1);
            for (let j = 15; j > 0; j--) {
                acc ^= gfMul(nextState[j], L_COEFFS[j - 1]);
            }
            nextState[0] = acc;
            state = nextState;
        }
        return state;
    }

    function getRoundConstants() {
        const constants = [];
        for (let i = 1; i <= 32; i++) {
            let c = new Uint8Array(16);
            c[15] = i; 
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
