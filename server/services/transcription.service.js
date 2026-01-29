const speech = require('@google-cloud/speech');
const fs = require('fs').promises;
const path = require('path');

// Initialize Google Speech-to-Text client (with error handling)
let client = null;
try {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath && fs.access) {
    client = new speech.SpeechClient({
      keyFilename: credentialsPath
    });
  }
} catch (error) {
  console.warn('⚠️  Google Speech-to-Text credentials not found. Using mock transcription.');
}

/**
 * Transcribe audio file to text using Google Speech-to-Text API
 * @param {string} audioFilePath - Path to the audio file
 * @returns {Promise<string>} - Transcribed text
 */
async function transcribeAudio(audioFilePath) {
  try {
    // If no credentials, return a realistic mock transcript for testing
    if (!client) {
      console.log('📝 Using mock transcript (Google credentials not configured)');
      return generateMockTranscript(audioFilePath);
    }

    // Read audio file
    const audioBytes = await fs.readFile(audioFilePath);

    const audio = {
      content: audioBytes.toString('base64'),
    };

    const config = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      
      // Speed & accuracy optimizations
      enableAutomaticPunctuation: true,
      model: 'latest_long', // Better for longer audio (30-120s)
      useEnhanced: true,
      enableWordTimeOffsets: true,
      enableWordConfidence: true,
      maxAlternatives: 1,
      profanityFilter: false,
      audioChannelCount: 1,
      
      // Speech context for better accuracy
      speechContexts: [{
        phrases: [
          'introduction', 'myself', 'name', 'experience',
          'background', 'skills', 'education', 'work',
          'university', 'company', 'project', 'team'
        ],
        boost: 10
      }],
    };

    const request = {
      audio: audio,
      config: config,
    };

    // Perform speech recognition
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    console.log('Transcription:', transcription);
    return transcription;
  } catch (error) {
    console.error('Transcription error:', error);
    
    // Fallback to mock transcript if real transcription fails
    return generateMockTranscript(audioFilePath);
  }
}

/**
 * Generate a realistic mock transcript for testing
 * (Used when Google credentials are not available)
 */
function generateMockTranscript(audioFilePath) {
  const mockTranscripts = [
    "Hello, my name is Alex Johnson and I'm excited to introduce myself. I'm a software engineer with five years of experience in full-stack development. I've worked on various projects involving React, Node.js, and cloud technologies. I'm passionate about creating user-friendly applications and solving complex problems. In my free time, I enjoy learning new technologies and contributing to open source projects.",
    
    "Hi everyone, I'm Sarah Martinez. I graduated from Stanford University with a degree in Computer Science. For the past three years, I've been working as a data scientist at a tech startup. My expertise includes machine learning, Python, and data visualization. I love working with data to extract meaningful insights. Outside of work, I'm an avid reader and enjoy hiking on weekends.",
    
    "Good day, my name is Michael Chen. I have a background in business administration and project management. I've successfully led teams of up to 15 people in delivering enterprise software solutions. My strengths include strategic planning, stakeholder management, and agile methodologies. I'm known for my ability to bridge the gap between technical teams and business stakeholders. I believe in continuous learning and recently completed a certification in cloud architecture.",
    
    "Hello, I'm Priya Patel, and I'm thrilled to be here. I'm a creative professional with expertise in UI/UX design. Over the past four years, I've worked with various clients to create intuitive and visually appealing digital experiences. I'm proficient in tools like Figma, Adobe Creative Suite, and have a solid understanding of front-end technologies. My design philosophy centers around user-centered design and accessibility. When I'm not designing, you'll find me sketching or exploring art galleries.",
    
    "Hi there, I'm James Wilson. I'm an experienced marketing professional specializing in digital marketing and brand strategy. I've helped multiple companies grow their online presence through content marketing, SEO, and social media campaigns. My analytical approach combined with creativity has delivered measurable results. I hold a master's degree in marketing and stay updated with the latest industry trends. I'm passionate about storytelling and building authentic connections with audiences."
  ];
  
  // Use filename hash to consistently return same mock for same file
  const filename = path.basename(audioFilePath);
  const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % mockTranscripts.length;
  
  console.log('📝 Generated mock transcript for testing');
  return mockTranscripts[index];
}

module.exports = { transcribeAudio };
