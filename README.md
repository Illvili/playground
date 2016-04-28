# playground
> have some fun with jade/typescript/sass

## structure
```
playground
	| build
		| css
		| lib
		| script
	| lib
	| src
		| jade
		| sass
		| ts
```
| Source | Type | Target |
| ------ | ---- | ------ |
| `lib` | Library | `build/lib` |
| `src/jade` | Jade, HTML | `build` |
| `src/sass` | SASS, CSS | `build/css` |
| `src/ts` | TypeScript, JavsScript | `build/script` |

## install
```
git clone https://github.com/Illvili/playground.git
cd playground
npm install
```

## run
```
gulp
```
