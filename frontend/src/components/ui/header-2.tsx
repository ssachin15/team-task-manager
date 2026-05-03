'use client';
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User, LayoutDashboard, FolderKanban } from 'lucide-react';

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		setOpen(false);
		navigate('/login');
	};

	const links = [
		{ label: 'Dashboard', to: '/', icon: LayoutDashboard },
		{ label: 'Projects', to: '/projects', icon: FolderKanban },
	];

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	}, [open]);

	return (
		<header className={cn(
			'sticky top-0 z-50 mx-auto w-full border-b border-transparent transition-all ease-out duration-300',
			{
				'bg-white/95 supports-[backdrop-filter]:bg-white/60 border-gray-200 backdrop-blur-xl shadow-sm': scrolled && !open,
				'bg-white/90 border-gray-100': !scrolled && !open,
				'bg-white/95': open,
			},
		)}>
			<nav className={cn(
				'flex h-16 w-full items-center justify-between px-6 max-w-7xl mx-auto transition-all ease-out duration-300',
				{ 'h-14': scrolled },
			)}>
				{/* LOGO */}
				<Link to="/" className="text-xl font-extrabold text-red-700 tracking-tight hover:text-red-800 transition-colors">
					TaskFlow
				</Link>

				{/* DESKTOP NAV */}
				<div className="hidden items-center gap-2 md:flex">
					{user && links.map(({ label, to, icon: Icon }) => (
						<NavLink
							key={label}
							to={to}
							className={({ isActive }) => cn(
								'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200',
								isActive
									? 'bg-red-50 text-red-700 border-red-200 shadow-sm'
									: 'text-gray-500 border-transparent hover:bg-red-50/60 hover:text-red-700 hover:border-red-100'
							)}
						>
							<Icon size={15} />
							{label}
						</NavLink>
					))}

					<div className="flex items-center gap-2 ml-3 border-l border-gray-200 pl-4">
						{user ? (
							<>
								<div className="flex items-center gap-2 text-sm text-gray-700 font-medium bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl">
									<div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
										<User size={12} className="text-white" />
									</div>
									<span className="hidden lg:inline">{user.name}</span>
								</div>
								<Button
									variant="outline"
									className="text-red-700 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-800 gap-1.5 transition-all duration-200"
									onClick={handleLogout}
								>
									<LogOut size={14} />
									Logout
								</Button>
							</>
						) : (
							<>
								<Link to="/login">
									<Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">Login</Button>
								</Link>
								<Link to="/signup">
									<Button className="bg-red-700 hover:bg-red-800 text-white border-0 shadow-sm">Sign Up</Button>
								</Link>
							</>
						)}
					</div>
				</div>

				{/* MOBILE MENU TOGGLE */}
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden border-gray-200">
					<MenuToggleIcon open={open} className="size-5 text-gray-700" duration={300} />
				</Button>
			</nav>

			{/* MOBILE NAV */}
			<div className={cn(
				'bg-white/98 backdrop-blur-xl fixed top-[64px] right-0 bottom-0 left-0 z-50 border-t border-gray-100 md:hidden transition-all duration-300',
				open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
			)}>
				<div className="flex h-full w-full flex-col justify-between gap-y-2 p-6">
					<div className="grid gap-y-2">
						{user && links.map(({ label, to, icon: Icon }) => (
							<NavLink
								key={label}
								to={to}
								onClick={() => setOpen(false)}
								className={({ isActive }) => cn(
									'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium border transition-all',
									isActive
										? 'bg-red-50 text-red-700 border-red-200'
										: 'text-gray-600 border-transparent hover:bg-red-50/60 hover:border-red-100 hover:text-red-700'
								)}
							>
								<Icon size={18} />
								{label}
							</NavLink>
						))}
					</div>

					<div className="flex flex-col gap-3 pb-8">
						{user ? (
							<>
								<div className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-2xl border border-red-100">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shadow-sm">
										<User size={16} className="text-white" />
									</div>
									<div>
										<p className="text-sm font-semibold text-gray-800">{user.name}</p>
										<p className="text-xs text-gray-500">{user.email}</p>
									</div>
								</div>
								<Button
									variant="outline"
									className="w-full h-12 text-base text-red-700 border-red-200 hover:bg-red-50 gap-2"
									onClick={handleLogout}
								>
									<LogOut size={18} />
									Logout
								</Button>
							</>
						) : (
							<>
								<Link to="/login" onClick={() => setOpen(false)}>
									<Button variant="outline" className="w-full h-12 text-base border-red-200 text-red-700 hover:bg-red-50">Login</Button>
								</Link>
								<Link to="/signup" onClick={() => setOpen(false)}>
									<Button className="w-full h-12 text-base bg-red-700 hover:bg-red-800 text-white border-0">Sign Up</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
