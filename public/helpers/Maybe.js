const Left = x => ({
  ap: monad => {
    return monad.map(x)
  },
  chain: f => Left(x),
  map: f => Left(x),
  fold: (f, g) => f(x),
  concat: o => Left(x),
  inspect: () => `Left(${x})`
});

const Right = x => ({
  ap: monad => monad.map(x),
  chain: f => f(x),
  map: f => Right(f(x)),
  fold: (f, g) => g(x),
  concat: o => o.fold(e => Left(e), r => Right(x.concat(r))),
  inspect: () => `Right(${x})`
});

const Maybe = x => x != null ? Right(x) : Left(null);

export default Maybe;
