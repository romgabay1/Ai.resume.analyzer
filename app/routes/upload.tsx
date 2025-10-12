import React, { useState, type FormEvent } from 'react'
import Navbar from '../components/Navbar'
import FileUploader from '../components/FileUploader'
import { usePuterStore } from '../lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '../lib/pdf2image';
import { generateUUID } from '../lib/utils';
import { prepareInstructions, AIResponseFormat } from '../../constants';

const upload = () => {
    const {auth,isLoading,fs,ai,kv} = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText, setStatusText] = useState('')
    const [file, setFile] = useState<File | null>(null)

    // Prevent browser from opening files when dropped outside the dropzone
    React.useEffect(() => {
        const preventDefaults = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e: Event) => {
            e.preventDefault();
        };

        window.addEventListener('dragover', preventDefaults);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragover', preventDefaults);
            window.removeEventListener('drop', handleDrop);
        };
    }, []);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    }

    const handleAnalyze=async({companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        setIsProcessing(true);
        setStatusText('Uploading the file...');
        const uploadedFile=await fs.upload([file]);
        if(!uploadedFile) return setStatusText('Failed to upload the file');
        setStatusText('converting to image...');
        const imageFile=await convertPdfToImage(file);
        if(!imageFile) return setStatusText('Failed to convert pdf to image');

        setStatusText('Uploading to image...');
        if(!imageFile.file) return setStatusText('Failed to convert pdf to image file');
        const uploadedImage=await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText('Failed to upload image');
        setStatusText('Preparing data...');
        const uuid=generateUUID();
        const data = {
            id: uuid, 
            resumePath: uploadedFile.path, 
            imagePath: uploadedImage.path, 
            companyName, jobTitle, jobDescription, 
            feedback:'',
        }
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText('Analyzing...');

    const feedback=await ai.feedback(
        uploadedFile.path,
         prepareInstructions({jobTitle, jobDescription, AIResponseFormat})
        )
        if (!feedback) return setStatusText('Error:Failed to analyze resume');

        const feedbackText=typeof feedback.message.content === 'string'
        ? feedback.message.content : feedback.message.content[0].text;

        data.feedback=JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting....');
        console.log(data);
        navigate(`/resume/${uuid}`);
}
    const handlesubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form=e.currentTarget.closest('form');
        if(!form) return;
        const formData=new FormData(form);
        const companyName=formData.get('company-name') as string;
        const jobTitle=formData.get('job-title') as string;
        const jobDescription=formData.get('job-description') as string;
        if (!file) return;

        handleAnalyze({companyName, jobTitle, jobDescription, file});

        const resume=formData.get('resume') as File;
        
        console.log(companyName, jobTitle, jobDescription, file);
    }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover"> 
    <Navbar />

    <section className='main-section'>
        <div className="page-heading py-16">
            <h1>Smart feedback for your resume</h1>
            {isProcessing ?(
                <> <h2>{statusText}</h2>
                <img src="/images/resume-scan.gif" className="w-full" />
                </>
            ):(
                <h2> Drop your resume for an ATS score and improvent tips! </h2>
            )}
            {!isProcessing && (
                <form id="upload-form" onSubmit={handlesubmit} className="flex flex-col gap-4 mt-8">
                <div className="form-div">
                    <label htmlFor="company-name">Company Name</label>
                    <input type="text" id="company-name" name="company-name" placeholder="Company Name" />
                </div>
                <div className="form-div">
                    <label htmlFor="job-title">Job Title</label>
                    <input type="text" id="job-title" name="job-title" placeholder="Job Title" />
                </div>
                <div className="form-div">
                    <label htmlFor="job-description">Job Description</label>
                    <textarea rows={5} id="job-description" name="job-description" placeholder="Description" />
                </div>
                <div className="form-div">
                    <label htmlFor="uploader">Upload Resume</label>
                    <FileUploader onFileSelect={handleFileSelect} />
                </div>
                <button className="primary-button" type="submit">
                    Analyze Resume
                </button>
                </form>
            )}
            
        </div>
    </section>
    </main>
  )
}

export default upload