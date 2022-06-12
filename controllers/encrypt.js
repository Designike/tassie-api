const AES = require("crypto-js/aes");
const enc = require("crypto-js/enc-utf8");

const encrypt = (data) => {
    return AES.encrypt(data, process.env.CRYPTO_SECRET).toString();
}

const decrypt = (cipher) => {
    let bytes  = AES.decrypt(cipher, process.env.CRYPTO_SECRET);
    return bytes.toString(enc);
}

const encrypt_object = (patient, time, appno) => {
    let symptoms = patient.symptoms.split(",");
    let sym_array = []
    symptoms.forEach(element => {
        sym_array.push(encrypt(element));
    });
    let updated = {
        name: encrypt(patient.name),
        number: encrypt(patient.number),
        city: encrypt(patient.city),
        country: encrypt(patient.country),
        dob: encrypt(patient.dob),
        symptoms: sym_array,
        gender: encrypt(patient.gender),
    }

    if(time) {
        current = new Date();
        updated.time = encrypt(current.toLocaleString());
    }
    if(appno) {
        current = new Date();
        updated.applicationNumber = encrypt(uuidv4());
    }

    return updated
}

const decrypt_object = (patient) => {
    let sym_array = []
    patient.symptoms.forEach(element => {
        sym_array.push(decrypt(element));
    });
    let decrypted = {
        _id: patient._id,
        name: decrypt(patient.name),
        number: decrypt(patient.number),
        city: decrypt(patient.city),
        country: decrypt(patient.country),
        dob: decrypt(patient.dob),
        symptoms: sym_array,
        time: decrypt(patient.time),
        applicationNumber: decrypt(patient.applicationNumber),
        gender: decrypt(patient.gender)
    }

    return decrypted
}

module.exports = {encrypt, encrypt_object, decrypt, decrypt_object}