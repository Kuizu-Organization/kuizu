import React from 'react';
import { ChevronDown } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-column">
                    <h5 className="footer-heading">About</h5>
                    <ul className="footer-list">
                        <li><a href="/about">About Kuizu</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h5 className="footer-heading">For students</h5>
                    <ul className="footer-list">
                        <li><a href="/flashcards">Flashcards</a></li>
                        <li><a href="/test">Test</a></li>
                        <li><a href="/learn">Learn</a></li>
                        <li><a href="/study-groups">Study groups</a></li>
                        <li><a href="/solutions">Solutions</a></li>
                        <li><a href="/plus">Kuizu Plus</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h5 className="footer-heading">For Teachers</h5>
                    <ul className="footer-list">
                        <li><a href="/live">Live</a></li>
                        <li><a href="/blog">Blog</a></li>
                        <li><a href="/teachers-plus">Kuizu Plus for Teachers</a></li>
                    </ul>
                </div>

                <div className="footer-column">
                    <h5 className="footer-heading">Resources</h5>
                    <ul className="footer-list">
                        <li><a href="/help">Help Center</a></li>
                        <li><a href="/signup">Sign up</a></li>
                        <li><a href="/honor-code">Honor Code</a></li>
                        <li><a href="/community">Community Guidelines</a></li>
                        <li><a href="/terms">Terms</a></li>
                        <li><a href="/privacy">Privacy</a></li>
                        <li><a href="/california-privacy">San Andreas Privacy</a></li>
                        <li><a href="/privacy-choices">Your Privacy Choices</a></li>
                        <li><a href="/ads-cookies">Ad and Cookie Policy</a></li>
                        <li><a href="/targeted-ads">Interest-Based Ads</a></li>
                        <li><a href="/schools">Kuizu for Schools</a></li>
                        <li><a href="/parents">Parents</a></li>
                    </ul>
                </div>

                <div className="footer-column footer-last-column">
                    <h5 className="footer-heading">Language</h5>
                    <div className="footer-language-selector">
                        <span>English</span>
                        <ChevronDown size={14} strokeWidth={3} />
                    </div>

                    <div className="footer-app-box">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Rickrolling_QR_code.png"
                            alt="Get the app"
                            className="qr-code-img"
                        />
                        <div className="app-box-text">
                            <span>Get the</span>
                            <span>app</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Kuizu Inc.</p>
            </div>
        </footer>
    );
};

export default Footer;
