import { useState, useEffect } from 'react';

const ADJECTIVES = [
	'Attractive', 'Bald', 'Beautiful', 'Chubby', 'Clean', 'Dazzling', 'Drab', 'Elegant', 'Fancy', 'Fit', 'Flabby',
	'Glamorous', 'Gorgeous', 'Handsome', 'Long', 'Magnificent', 'Muscular', 'Plain', 'Plump', 'Quaint', 'Scruffy',
	'Shapely', 'Short', 'Skinny', 'Stocky', 'Ugly', 'Unkempt', 'Unsightly', 'Aggressive', 'Agreeable', 'Ambitious',
	'Brave', 'Calm', 'Delightful', 'Eager', 'Faithful', 'Gentle', 'Happy', 'Jolly', 'Kind', 'Lively', 'Nice', 'Obedient',
	'Polite', 'Proud', 'Silly', 'Thankful', 'Victorious', 'Witty', 'Wonderful', 'Zealous', 'Angry', 'Bewildered',
	'Clumsy', 'Defeated', 'Embarrassed', 'Fierce', 'Grumpy', 'Helpless', 'Itchy', 'Jealous', 'Lazy', 'Mysterious',
	'Nervous', 'Obnoxious', 'Panicky', 'Pitiful', 'Repulsive', 'Scary', 'Thoughtless', 'Uptight', 'Worried', 'Broad',
	'Chubby', 'Crooked', 'Curved', 'Deep', 'Flat', 'High', 'Hollow', 'Low', 'Narrow', 'Refined', 'Round', 'Shallow',
	'Skinny', 'Square', 'Steep', 'Straight', 'Wide', 'Big', 'Colossal', 'Fat', 'Gigantic', 'Great', 'Huge', 'Immense',
	'Large', 'Little', 'Mammoth', 'Massive', 'Microscopic', 'Miniature', 'Petite', 'Puny', 'Scrawny', 'Short', 'Small',
	'Tall', 'Teeny', 'Tiny'
];

const ANIMALS = [
	'Aardvark', 'Albatross', 'Alligator', 'Alpaca', 'Ant', 'Anteater', 'Antelope', 'Ape', 'Armadillo', 'Donkey', 'Baboon',
	'Badger', 'Barracuda', 'Bat', 'Bear', 'Beaver', 'Bee', 'Bison', 'Boar', 'Buffalo', 'Butterfly', 'Camel', 'Capybara',
	'Caribou', 'Cassowary', 'Cat', 'Caterpillar', 'Cattle', 'Chamois', 'Cheetah', 'Chicken', 'Chimpanzee', 'Chinchilla',
	'Chough', 'Clam', 'Cobra', 'Cockroach', 'Cod', 'Cormorant', 'Coyote', 'Crab', 'Crane', 'Crocodile', 'Crow', 'Curlew',
	'Deer', 'Dinosaur', 'Dog', 'Dogfish', 'Dolphin', 'Dotterel', 'Dove', 'Dragonfly', 'Duck', 'Dugong', 'Dunlin', 'Eagle',
	'Echidna', 'Eel', 'Eland', 'Elephant', 'Elk', 'Emu', 'Falcon', 'Ferret', 'Finch', 'Fish', 'Flamingo', 'Fly', 'Fox',
	'Frog', 'Gaur', 'Gazelle', 'Gerbil', 'Giraffe', 'Gnat', 'Gnu', 'Goat', 'Goldfinch', 'Goldfish', 'Goose', 'Gorilla',
	'Goshawk', 'Grasshopper', 'Grouse', 'Guanaco', 'Gull', 'Hamster', 'Hare', 'Hawk', 'Hedgehog', 'Heron', 'Herring',
	'Hippopotamus', 'Hornet', 'Horse', 'Human', 'Hummingbird', 'Hyena', 'Ibex', 'Ibis', 'Jackal', 'Jaguar', 'Jay',
	'Jellyfish', 'Kangaroo', 'Kingfisher', 'Koala', 'Kookabura', 'Kouprey', 'Kudu', 'Lapwing', 'Lark', 'Lemur', 'Leopard',
	'Lion', 'Llama', 'Lobster', 'Locust', 'Loris', 'Louse', 'Lyrebird', 'Magpie', 'Mallard', 'Manatee', 'Mandrill',
	'Mantis', 'Marten', 'Meerkat', 'Mink', 'Mole', 'Mongoose', 'Monkey', 'Moose', 'Mosquito', 'Mouse', 'Mule', 'Narwhal',
	'Newt', 'Nightingale', 'Octopus', 'Okapi', 'Opossum', 'Oryx', 'Ostrich', 'Otter', 'Owl', 'Oyster', 'Panda', 'Panther',
	'Parrot', 'Partridge', 'Peafowl', 'Pelican', 'Penguin', 'Pheasant', 'Pig', 'Pigeon', 'Pony', 'Porcupine', 'Porpoise',
	'Quail', 'Quelea', 'Quetzal', 'Rabbit', 'Raccoon', 'Rail', 'Ram', 'Rat', 'Raven', 'Reindeer', 'Rhinoceros', 'Rook',
	'Salamander', 'Salmon', 'Sandpiper', 'Sardine', 'Scorpion', 'Seahorse', 'Seal', 'Shark', 'Sheep', 'Shrew', 'Skunk',
	'Snail', 'Snake', 'Sparrow', 'Spider', 'Spoonbill', 'Squid', 'Squirrel', 'Starling', 'Stingray', 'Stinkbug', 'Stork',
	'Swallow', 'Swan', 'Tapir', 'Tarsier', 'Termite', 'Tiger', 'Toad', 'Trout', 'Turkey', 'Turtle', 'Viper', 'Vulture',
	'Wallaby', 'Walrus', 'Wasp', 'Weasel', 'Whale', 'Wildcat', 'Wolf', 'Wolverine', 'Wombat', 'Woodcock', 'Woodpecker',
	'Worm', 'Wren', 'Yak', 'Zebra'
];

const useRandomName = (): string => {
	const [name, setName] = useState('');
	
	useEffect(() => {
		const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
		const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
		setName(`${adj} ${animal}`);
	}, []);
	
	return name;
};

export default useRandomName;
