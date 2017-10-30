const json = {
  user: {
    id: 1,
    firstName: 'Black',
    lastName: 'Knight',
    hash: 12345,
    friends: [2, 3, 4],
    catchPhrase: 'None shall pass',
    bodyParts: {
      intact: ['head'],
      loppedOff: ['left-arm', 'right-arm', 'left-leg', 'right-leg']
    },
    thinksArthurIsACoward: true,
  },
  garments: {
    tees: [
      {id: 4, tags: ['black', 'xl', 'has text']},
      {id: 5, tags: ['black', 'xl']},
      {id: 6, tags: ['xl', 'very dark grey']}],
    armors: [
      {id: 9, tags: ['black', 'arm', 'right']},
      {id: 10, tags: ['black', 'arm', 'left']},
      {id: 11, tags: ['black', 'leg', 'right']},
      {id: 12, tags: ['black', 'leg', 'left']},
      {id: 13, tags: ['black', 'chest']},
      {id: 15, tags: ['very dark grey', 'chest']},
      {id: 14, tags: ['black', 'helmet', 'fluted']},
      {id: 16, tags: ['very dark grey', 'helmet']}]
  }
};

export { json as default };