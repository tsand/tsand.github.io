import { FaGithub, FaLinkedin } from "react-icons/fa";
import Image from "next/image";

export default function Home() {
    return (
        <div className="flex items-center justify-center min-h-screen p-6 md:p-12">
            <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="mb-8 flex justify-center">
                    <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full border-4 border-foreground/10 hover-scale shadow-xl profile-glow">
                        <Image
                            src="/profile.jpg"
                            alt="Theisen Sanders Profile Picture"
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 768px) 128px, 160px"
                        />
                    </div>
                </div>

                <h1
                    className="text-5xl md:text-6xl font-bold mb-2 sm:mb-4 tracking-tight animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}>
                    Theisen Sanders
                </h1>

                <p
                    className="text-xl md:text-2xl mb-2 text-foreground/70 animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}>
                    Engineering • Product • Leadership
                </p>

                <p
                    className="text-base md:text-lg mb-6 sm:mb-8 text-foreground/50 animate-fade-in-up"
                    style={{ animationDelay: "0.4s" }}>
                    Full-stack generalist who ships and scales
                </p>

                <div
                    className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up"
                    style={{ animationDelay: "0.5s" }}>
                    <a
                        href="https://github.com/tsand"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-github"
                        aria-label="GitHub Profile">
                        <FaGithub className="text-xl" />
                        <span>GitHub</span>
                    </a>

                    <a
                        href="https://linkedin.com/in/theisensanders"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-linkedin"
                        aria-label="LinkedIn Profile">
                        <FaLinkedin className="text-xl" />
                        <span>LinkedIn</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
