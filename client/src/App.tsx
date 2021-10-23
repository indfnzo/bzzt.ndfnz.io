import React, { useLayoutEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import 'normalize.css';

import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import RoomLanding from './pages/RoomLanding';

const defaultTheme = {
	primary: {
		main: '#343781'
	},

	secondary: {
		main: '#E38A22'
	},

	red: '#E72424',
	lightRed: '#FF9090',

	orange: '#F59421',
	lightOrange: '#F8CA95',

	yellow: '#FEDB22',
	lightYellow: '#FFEE93',

	green: '#0DB61E',
	lightGreen: '#00F076',

	blue: '#1370DD',
	lightBlue: '#00E3FF',

	purple: '#9017EF',
	lightPurple: '#C68DF3',

	transitions: {
		easeOutQuint: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)'
	}
};

const HeightController = () => {
	useLayoutEffect(() => {
		const updateHeight = () => {
			// We set a height variable for the CSS to use.
			// This allows us to resolve 100vh issues on mobile browsers.
			document.documentElement.style.setProperty('--innerHeight', `${window.innerHeight}px`);
		};

		updateHeight();
		window.addEventListener('resize', updateHeight);

		return () => {
			window.removeEventListener('resize', updateHeight);
		}
	}, []);

	return null;
}

function App() {
	return (
		<ThemeProvider theme={defaultTheme}>
			<BrowserRouter>
				<Switch>
				<Route exact path="/"><Home /></Route>
				<Route exact path="/room/new"><CreateRoom /></Route>
				<Route exact path="/room/join"><JoinRoom /></Route>
				<Route exact path="/room"><Redirect to="/room/join" /></Route>
				<Route path="/room/:roomCode"><RoomLanding /></Route>
				</Switch>
			</BrowserRouter>
			<HeightController />
		</ThemeProvider>
	);
}

export default App;
