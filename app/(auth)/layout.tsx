const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full w-full bg-white">
            {children}
        </div>
    )
}
export default AuthLayout;