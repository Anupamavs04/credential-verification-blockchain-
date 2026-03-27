pragma circom 2.0.0;
include "node_modules/circomlib/circuits/poseidon.circom";

template VerifyCertificate() {
    signal input ipfsHashAsNumber;
    signal input blockchainRoot;
    signal output isValid;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== ipfsHashAsNumber;
    hasher.out === blockchainRoot;

    isValid <== 1;
}

component main {public [blockchainRoot]} = VerifyCertificate();