module.exports = {
    content: ["./src/**/*.{ts,tsx,js,jsx}"],
    theme:{
        extend:{
            keyframes:{
                'chevron-float' : {
                    '0%, 100%' : {transform:'translateY(0)'},
                    '50%': {transform: 'translateY(0.2rem)'}
                }
            },
            animation: {
                'chevron-float-once': 'chevron-float 1.2s ease-in-out 1',
                'chevron-float': 'chevron-float 1.2s ease-in-out infinite'
            }
        }
    },
    plugins:[]
};