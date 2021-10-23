import React from 'react';
import styled, { keyframes } from 'styled-components';
import { sample } from 'lodash';
import { lighten } from 'polished';

import { ButtonGroup, ButtonLink, SineWave } from '../components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiceFive, faGamepad, faLaptopCode, faShareAlt, faTrophy } from '@fortawesome/free-solid-svg-icons';

const shiftLeft = keyframes`
	from { left: -200%; }
	to   { left: 0; }
`;

const HomeWrapper = styled.main`
	section.masthead {
		position: relative;
		padding-bottom: 4rem;
		background: ${props => props.theme.primary.main};
		color: white;
		z-index: 1;

		.logo {
			padding: 3rem 0 1rem;

			svg {
				width: 4rem;
				height: 4rem;
			}
		}

		h1 {
			margin: 4rem 0 0;
			font-size: 3rem;
			font-weight: 900;
		}

		.subtitle {
			margin: 1rem 0 4rem;
			font-size: 1.5rem;
			font-weight: 700;
			color: ${props => lighten(0.25, props.theme.primary.main)};
		}

		.divider {
			display: flex;
			align-items: flex-end;
			justify-content: flex-end;
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 2rem;
			z-index: -1;

			.sine-wave {
				position: absolute;
				top: 0;
				left: -200%;
				width: 400%;
				height: 100%;

				&.wave-bottom {
					z-index: 1;
					animation: ${shiftLeft} 5s linear infinite;
				}

				&.wave-top {
					z-index: 2;
					animation: ${shiftLeft} 3s linear infinite;
				}
			}
		}

		@media screen and (min-width: 240px) {
			padding-bottom: 8rem;
			.divider { height: 4rem; }
		}

		@media screen and (min-width: 480px) {
			padding-bottom: 10rem;
			.divider { height: 6rem; }
		}

		@media screen and (min-width: 960px) {
			padding-bottom: 12rem;
			.divider { height: 8rem; }
		}
	}

	section.details {
		padding: 2rem 0;

		@media screen and (min-width: 960px) {
			padding: 4rem 0;
		}

		.feature-section {
			display: flex;
			justify-content: center;
			flex-wrap: wrap;
			padding: 2rem 0 4rem;

			&:nth-child(even) {
				flex-direction: row-reverse;
			}

			.content {
				flex: 0 0 100%;

				@media screen and (min-width: 960px) {
					flex: 1;
					max-width: 75%;
					flex-basis: 75%;
					margin-right: 4rem;
				}

				@media screen and (min-width: 1200px) {
					max-width: 67.5%;
					flex-basis: 67.5%;
				}

				@media screen and (min-width: 1440px) {
					max-width: 50%;
					flex-basis: 50%;
				}
			}

			.spacer {
				flex: 0 0 100%;

				@media screen and (min-width: 960px) {
					flex: 0 0 4rem;
					text-align: center;
					margin-right: 4rem;
				}

				.section-icon {
					position: relative;
					display: inline-block;
					margin: 2rem 0;
					width: 4rem;
					text-align: center;
					font-size: 0;

					svg {
						font-size: 2rem;
						color: ${props => props.theme.primary.main};
					}

					&::before {
						content: "";
						position: absolute;
						top: calc(50% - 2rem);
						left: calc(50% - 2rem);
						width: 4rem;
						height: 4rem;
						border-radius: 50%;
						background: ${props => props.theme.lightBlue};
						opacity: 0.25;
						z-index: -1;
					}
				}
			}
		}

		h2 {
			margin: 2rem 0 1rem;
			font-size: 2rem;
			font-weight: 900;
		}

		p {
			margin: 1em 0;
			font-size: 1.5rem;

			&.muted {
				margin: 0.5em 0;
				font-size: 1.25rem;
				color: #808080;
			}

			&.subtext {
				margin: 0.5em 0;
				font-size: 1rem;
				color: #A0A0A0;
				font-style: italic;
			}

			strong {
				font-weight: 900;
			}

			a {
				position: relative;
				display: inline-block;
				color: ${props => props.theme.red};
				font-weight: 700;
				text-decoration: none;
				transition: all 250ms ease-out;

				&::before {
					content: "";
					position: absolute;
					top: 0;
					bottom: 0;
					left: -0.25rem;
					width: calc(100% + 0.5rem);
					background: ${props => props.theme.lightYellow};
					opacity: 0;
					transform: scaleX(0.01);
					transform-origin: bottom right;
					transition: transform 500ms ${props => props.theme.transitions.easeOutQuint}, opacity 400ms 100ms ${props => props.theme.transitions.easeOutQuint};
					z-index: -1;
					pointer-events: none;
				}

				&:hover, &:focus {
					outline: none;

					&::before {
						opacity: 1;
						transform: scaleX(1);
						transform-origin: bottom left;
						transition: transform 500ms ${props => props.theme.transitions.easeOutQuint}, opacity 100ms ${props => props.theme.transitions.easeOutQuint};
					}
				}
			}
		}

		.fyis {
			p {
				margin: 0.25rem 0;
				font-size: 1.25rem;

				&.muted {
					font-size: 1rem;
				}
			}

			.question {
				margin: 2rem 0 0.25rem;
				font-weight: 700;
				color: ${props => props.theme.primary.main};

				p {
					font-size: 1rem;
				}
			}

			.answer {
				margin: 0.25rem 0 2rem;
			}
		}
	}

	footer.footer {
		position: relative;
		margin-top: 4rem;
		padding: 2rem 0 4rem;
		background: #1a1a1a;
		color: white;
		font-size: 1.25rem;
		z-index: 1;

		.divider {
			display: flex;
			align-items: flex-end;
			justify-content: flex-end;
			position: absolute;
			bottom: 100%;
			left: 0;
			right: 0;
			height: 2rem;
			z-index: 1;

			.sine-wave {
				position: absolute;
				top: 0;
				left: -200%;
				width: 400%;
				height: 100%;

				&.wave-bottom {
					z-index: 1;
					animation: ${shiftLeft} 10s linear infinite;
				}

				&.wave-top {
					z-index: 2;
					animation: ${shiftLeft} 8s linear infinite;
				}
			}

			@media screen and (min-width: 240px) {
				height: 3rem;
			}

			@media screen and (min-width: 480px) {
				height: 4rem;
			}

			@media screen and (min-width: 960px) {
				height: 5rem;
			}
		}

		.logo-text {
			font-size: 2rem;
		}

		a {
			position: relative;
			display: inline-block;
			color: white;
			font-weight: 700;
			text-decoration: none;
			transition: all 250ms ease-out;

			&::before {
				content: "";
				position: absolute;
				top: 0;
				bottom: 0;
				left: -0.25rem;
				width: calc(100% + 0.5rem);
				background: ${props => props.theme.primary.main};
				opacity: 0;
				transform: scaleX(0.01);
				transform-origin: bottom right;
				transition: transform 500ms ${props => props.theme.transitions.easeOutQuint}, opacity 400ms 100ms ${props => props.theme.transitions.easeOutQuint};
				z-index: -1;
				pointer-events: none;
			}

			&:hover, &:focus {
				outline: none;

				&::before {
					opacity: 1;
					transform: scaleX(1);
					transform-origin: bottom left;
					transition: transform 500ms ${props => props.theme.transitions.easeOutQuint}, opacity 100ms ${props => props.theme.transitions.easeOutQuint};
				}
			}
		}

		hr {
			margin: 2rem 0;
			padding: 0;
			border: none;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		}

		.footer-message {
			color: #808080;
		}
	}
`;

const BzztLogoSvgWrapper = styled.svg`
	height: 0.9em;
	width: auto;
	margin-bottom: -0.1em;
	vertical-align: baseline;
`;

const BzztLogoText = (props: { fill?: string }) => {
	const fillColor = props.fill || '#343781';

	return (
		<BzztLogoSvgWrapper className="logo-text" width="101" height="40" viewBox="0 0 101 40" fill="none" xmlns="http://www.w3.org/2000/svg">
			<title>BZZT</title>
			<path fillRule="evenodd" clipRule="evenodd" d="M31 0V8H44.3333L31 24V32H47V40H71V32H57.6667L71 16V8H55V0H31ZM41.6667 24L48.3333 16H60.3333L53.6667 24H41.6667Z" fill={fillColor} />
			<path fillRule="evenodd" clipRule="evenodd" d="M17.8462 36H0V4H17.1955C23.2837 4 27.5128 7.40029 27.5128 12.0582C27.5128 15.179 25.8862 17.8806 23.0978 19.2314C26.8157 20.8151 29 23.8428 29 27.3828C29 32.5065 24.3526 36 17.8462 36ZM9 11.5924H15.0112C16.8702 11.5924 18.2179 12.6172 18.2179 14.0146C18.2179 15.4119 16.8702 16.4367 15.0112 16.4367H9V11.5924ZM9 23.2838H16.359C18.3109 23.2838 19.7051 24.3552 19.7051 25.8457C19.7051 27.3362 18.3109 28.4076 16.359 28.4076H9V23.2838Z" fill={fillColor} />
			<path d="M73 4V12H83V36H91V12H101V4H73Z" fill={fillColor} />
		</BzztLogoSvgWrapper>
	);
}

const HOME_SUBTITLE = sample([
	'The best online buzzer 😎',
	'Non-humans are also welcome! 😺🙉🐶🐓🐷',
	'For the sadistic button smashers 😈',
	'No friends? Just open multiple tabs and play with yourself! 🥶',
	'Look at these moving sine waves 🌊🌊',
	'SHEEEEEEEEESSHH 😩👉🤚',
	'What does the bee say? BZZZZZT 🐝🐝',
	'The Ultimate Buzzer for millenials 👶 (and above 👴)',
	'The one and only Screaming Button™ you can trust.'
]);

const Home = () => {

	return (
		<HomeWrapper className="home">
			<section className="masthead">
				<div className="stacking-container">
					<div className="logo">
						<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="32" cy="32" r="32" fill="white"/>
							<circle cx="32" cy="32" r="28" fill="#343781"/>
							<path d="M8 8H28V28H8V8Z" fill="#343781"/>
							<path d="M36 36H56V56H36V36Z" fill="#343781"/>
							<path fill-rule="evenodd" clip-rule="evenodd" d="M32 12H12V20H25.3334L12 36V44H16H28V52H32H52V44H38.6667L52 28V20H48H36V12H32ZM22.6667 36L29.3334 28H41.3334L34.6667 36H22.6667Z" fill="white"/>
						</svg>
					</div>
					<h1>
						Need a buzzer?
						<br/>
						<BzztLogoText fill="white" /> it! 📢
					</h1>
					<p className="subtitle">
						{HOME_SUBTITLE || 'The best online buzzer.'}
					</p>
					<ButtonGroup>
						<ButtonLink inverted to="/room/new">Create Room</ButtonLink>
						<ButtonLink inverted color="secondary" to="/room/join">Join Room</ButtonLink>
					</ButtonGroup>
					<div className="divider">
						<SineWave className="wave-bottom" fill="#E38A22" />
						<SineWave className="wave-top" fill="white" />
					</div>
				</div>
			</section>
			<section className="details">
				<div className="stacking-container">
					<div className="feature-section">
						<div className="spacer">
							<div className="section-icon">
								<FontAwesomeIcon icon={faDiceFive} />
							</div>
						</div>
						<div className="content">
							<h2>What the 🤬 is this?</h2>
							<p>
								<BzztLogoText fill="black" /> is a <a href="/room/new">free</a> &amp; <a href="mailto:jerome@ndfnz.io?subject=[BZZT] Repo Access Request">open source</a> buzzer app built to make buzzer-based games more fun.
							</p>
							<p>
								Play online quiz, host trivia night, facilitate company games, or even arrange your own Zoom party games to entertain your friends and family.
							</p>
						</div>
					</div>
					<div className="feature-section">
						<div className="spacer">
							<div className="section-icon">
								<FontAwesomeIcon icon={faTrophy} />
							</div>
						</div>
						<div className="content">
							<h2>Why <BzztLogoText />?</h2>
							<p>
								<strong>100% Free! 💯</strong>
								<br/>No premium passes, no subscriptions, no ads.
							</p>
							<p>
								<strong>In-Room Chat! 💬</strong>
								<br/>Integrated chat available for everyone.
							</p>
							<p>
								<strong>The eye-candy! 🍭</strong>
								<br/>Come for the <em>Big Red Screaming Button™</em>, stay for the fun &amp; awesome animations!
							</p>
							<p>
								<strong>Limitless! 🛫</strong>
								<br/>Maximum room time and player count? No thanks! We don't have any usage limits (for now), so go wild!
								<p className="subtext">
									PS: Don't expect too much though, that's obviously untested (who even has that many friends??). Also, this entire site is running on a potato server.
								</p>
							</p>
						</div>
					</div>
					<div className="feature-section">
						<div className="spacer">
							<div className="section-icon">
								<FontAwesomeIcon icon={faGamepad} />
							</div>
						</div>
						<div className="content">
							<h2>Nice! How do I use it?</h2>
							<p>
								Try <a href="/room/new">creating a room</a>! You can open your room in multiple devices or browser windows, give yourself different names, and play around with the buzzer.
								<p className="muted">
									Protip: Click the <FontAwesomeIcon icon={faShareAlt} /> button to copy your room's link.
								</p>
							</p>
							<p>
								Once you're comfortable hosting your own game, you can send your invite link to your friends so they can join. 👨‍👨‍👦‍👦
							</p>
						</div>
					</div>
					<div className="feature-section fyis">
						<div className="spacer">
							<div className="section-icon">
								<FontAwesomeIcon icon={faLaptopCode} />
							</div>
						</div>
						<div className="content">
							<h2>Technical FYIs</h2>
							<p className="muted">
								Nobody really asks these questions;<br/>but in case you're curious, here you go:
							</p>

							<div className="question">
								<p>Is my data private?</p>
							</div>
							<div className="answer">
								<p>We don't log anything. Not even errors.</p>
								<p>For each room, we use the usernames provided as the players' canonical identities for that room. This way, we don't need to use any browser user-agent data or IP address to keep track of players.</p>
								<p className="muted">Btw, we don't keep chat history either. If you're not connected in a room when a message is broadcasted, you won't get it at all.</p>
							</div>

							<div className="question">
								<p>Tech stack?</p>
							</div>
							<div className="answer">
								<p>React, Koa.js, socket.io.</p>
							</div>

							<div className="question">
								<p>Where's the source code?</p>
							</div>
							<div className="answer">
								<p>On GitHub, but I'm temporarily keeping it private until I sort some CI-related things out.</p>
							</div>

							<div className="question">
								<p>Rate limits?</p>
							</div>
							<div className="answer">
								<p>Not much rate limiting happens here, code-wise. Your browser (and my $5/mo. DigitalOcean server) is the only limit.</p>
								<p className="muted">Yes, I know, that's pretty bad... If you keep running into serious network issues with the app, feel free to email me about it and I'll consider upgrading.</p>
							</div>

							<div className="question">
								<p>Can I just self-host?</p>
							</div>
							<div className="answer">
								<p>Sure! <a href="mailto:jerome@ndfnz.io?subject=[BZZT] Self Host Request">Shoot me an email</a> so I can give you repo access and deployment instructions.</p>
							</div>
						</div>
					</div>
				</div>
			</section>
			<footer className="footer">
				<div className="divider">
					<SineWave className="wave-bottom" fill="#343781" />
					<SineWave className="wave-top" fill="#1A1A1A" />
				</div>
				<div className="stacking-container">
					<BzztLogoText fill="white" />
					<div className="footer-message">
						<p>
							Need a buzzer?
						</p>
					</div>
					<hr />
					<div className="copyright">
						&copy; { new Date().getFullYear() } <a href="mailto:jerome@ndfnz.io">ndfnz.io</a>
					</div>
				</div>
			</footer>
		</HomeWrapper>
	);
}

export default Home;
