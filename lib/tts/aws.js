const fs = require('fs');
const util = require('util');
var path = require("path");


const { PollyClient, StartSpeechSynthesisTaskCommand, GetSpeechSynthesisTaskCommand } = require('@aws-sdk/client-polly')

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')

const { AudioTools } = require('../audio/audio');

// Set the AWS Region.
const REGION = "us-east-1"; //e.g. "us-east-1"
// Create an Amazon S3 service client object.
const pollyClient = new PollyClient({ region: REGION });
const s3Client = new S3Client({ region: REGION });

class SpeechToText {
    
    path;
    params = {
        OutputFormat: "mp3",
        OutputS3BucketName: "ringer-teste-polly",
        // Text: "Olá, meu nome é Vitória. Eu posso ler qualquer texto que você digitar aqui.",
        TextType: "text",
        LanguageCode: "pt-BR",
        VoiceId: "Camila",
        SampleRate: "22050",
        // Engine: "neural"
      }

    #voices = {
        standard: {
            masculine: 'Ricardo',
            femenine: 'Camila'
        },
        neural: {
            masculine: 'Thiago',
            femenine: 'Camila'
        }
    }
    constructor(path, neural, voiceGender){
        this.path = path;

        if(neural) this.params.Engine = 'neural';
        
        this.params.VoiceId = this.#voices[neural ? 'neural': 'standard'][voiceGender ? 'masculine' : 'femenine'];
        
    }

    async run(texts){

        //create temp bucket

        let requests = [];
        for (const t of texts) {
            requests.push(pollyClient.send(new StartSpeechSynthesisTaskCommand({...this.params, Text: t})))
        }

        let results = await Promise.all(requests);

        // console.log(JSON.stringify(results));

        let condition = true;
        let cicles = 0;
        do{
            await new Promise(resolve => setTimeout(resolve, 5000));

            const  tasks = [];
            for (const r of results) {
                tasks.push(pollyClient.send(new GetSpeechSynthesisTaskCommand({
                    TaskId: r.SynthesisTask.TaskId
                })))           
            }

            results = await Promise.all(tasks);

            cicles++;
            condition = results.some(r => r.SynthesisTask.TaskStatus != 'completed');
        }while(condition && cicles < 6);
        
        let requests2 = [];
        for (const r of results) {
            requests2.push(s3Client.send(new GetObjectCommand({
                Bucket: "ringer-teste-polly",
                Key: `${r.SynthesisTask.TaskId}.mp3`
            })));
        }

        let results2 = await Promise.all(requests2);

        let counter = 0;
        const temp_dir = `${this.path}/aws/temp`;
        fs.mkdirSync(temp_dir);
        for (const r of results2) {
            let dest = fs.createWriteStream(`${temp_dir}/${counter}.mp3`)
            
            const stream = r.Body.pipe(dest);

            await new Promise(f => stream.on('finish', f));
            counter++
        }
        
        const tools = new AudioTools();

        const a = fs.readdirSync(`${temp_dir}/`);
        console.log(a.map(e => path.resolve(`${temp_dir}/`, e)));

        await tools.concatenate(`C:\\Users\\Carlos\\Desktop\\Repos\\teste-text-to-speech\\records\\aws\\result.mp3`, a.map(e => path.resolve(`${temp_dir}/`, e)));
        fs.rmSync(temp_dir, { recursive: true, force: true });
        
    }
}

module.exports = { SpeechToText }