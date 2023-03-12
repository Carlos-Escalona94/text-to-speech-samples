const fs = require('fs');
const util = require('util');


const  textToSpeech  = require('@google-cloud/text-to-speech')

// Set the AWS Region.
const client = new textToSpeech.TextToSpeechClient();

class SpeechToText {
    
    path;
    #voice;
    #languageCode = "pt-BR"
    
    #voices = {
        standard: {
            masculine: 'pt-BR-Standard-B',
            femenine: 'pt-BR-Standard-A'
        },
        neural: {
            masculine: 'pt-BR-Neural2-B',
            femenine: 'pt-BR-Neural2-A'
        }
    }

    constructor(path, neural, voiceGender){
        this.path = path;

        this.#voice = this.#voices[neural ? 'neural': 'standard'][voiceGender ? 'masculine' : 'femenine'];
    }

    async run(texts){

        const requests = [];
        for (const t of texts) {
            requests.push(client.synthesizeSpeech({
                input: {
                    text: t
                },
                voice: {
                    languageCode: this.#languageCode,
                    name: this.#voice
                },
                audioConfig: {
                    audioEncoding: 'MP3'
                }
            }))
        }

        let results = await Promise.all(requests);
        
        const temp_dir = `${this.path}/aws/temp`;
        fs.mkdirSync(temp_dir);

        let counter = 0;
        for (const [response] of results) {
            const writeFile = util.promisify(fs.writeFile);
            await writeFile(`${temp_dir}/${counter}.mp3`, response.audioContent, 'binary');
            console.log('Audio content written to file: output.mp3')
            counter++;
        }
        // fs.rmSync(temp_dir, { recursive: true, force: true });
    }

    // async list(){

    //     const teste = this.#languageCode;
    //     const [result] = await client.listVoices({teste});
    //     const voices = result.voices;

    //     voices.forEach((voice) => {
    //         if(voice.name.startsWith('pt-BR'))
    //             console.log(`${voice.name} (${voice.ssmlGender}): ${voice.languageCodes}`);
    //     });
    // }
}

module.exports = { SpeechToText }