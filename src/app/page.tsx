import { FaGithub, FaLinkedin } from "react-icons/fa";
import Image from "next/image";

export default function Home() {
    return (
        <div className="flex items-center justify-center min-h-screen p-6 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
                <div className="mb-8 flex justify-center">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full border-4 border-foreground/10">
                        <Image
                            src="/profile.jpg"
                            alt="Profile Photo"
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 768px) 128px, 160px"
                        />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
                    I used to try to blog here
                </h1>

                <p className="text-lg mb-12 text-opacity-80 max-w-2xl mx-auto">
                    Welcome to my small corner of the internet. Here&apos;s
                    where you can find me elsewhere.
                </p>

                <div className="flex justify-center space-x-8 md:space-x-12">
                    <a
                        href="https://github.com/tsand"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-4 rounded-lg transition-all bg-gray-800 hover:bg-gray-700 text-white shadow-md hover:shadow-lg"
                        aria-label="GitHub Profile">
                        <FaGithub className="text-2xl" />
                        <span className="font-medium">GitHub</span>
                    </a>

                    <a
                        href="https://linkedin.com/in/theisensanders"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-4 rounded-lg transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-md hover:shadow-lg"
                        aria-label="LinkedIn Profile">
                        <FaLinkedin className="text-2xl" />
                        <span className="font-medium">LinkedIn</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
