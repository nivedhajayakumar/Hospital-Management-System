import { useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import axios from 'axios';
import { BACKEND_URL } from '@/config';
import { HOSPITAL_CODE } from '@/config';
import { useNavigate } from 'react-router-dom';

interface Department {
  id: string;
  name: string;
}

interface SignUpFormState {
  name: string;
  contact: string;
  departmentId: string;
  password: string;
  gender: string;
  designation: string;
}

export function RegisterComponent() {
  const [formState, setFormState] = useState<SignUpFormState>({
    name: '',
    contact: '',
    departmentId: '',
    password: '',
    gender: '',
    designation: '',
  });
  
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  const [isOTPSent, setIsOTPSent] = useState<boolean>(false);
  const [isOTPVerified, setIsOTPVerified] = useState<boolean>(false);

  const [departments, setDepartments] = useState<Department[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleDepartmentSelect = (departmentId: string) => {
    setFormState(prevState => ({
      ...prevState,
      departmentId,
    }));
  };

  const handleGenderSelect = (gender: string) => {
    setFormState(prevState => ({
      ...prevState,
      gender,
    }));
  };

  const handleDesignationSelect = (designation: string) => {
    setFormState(prevState => ({
      ...prevState,
      designation,
    }));
  };

  const handleSendOTP = async () => {
    const response = await axios.post(`${BACKEND_URL}/api/sendotp`, { email });
    setIsOTPSent(true);
  };

  const handleVerifyOTP = async () => {
    const response = await axios.post(`${BACKEND_URL}/api/verifyotp`, { email, otp });
    alert(response.data.message);
    if (response.data.message === "OTP verified") {
      setIsOTPVerified(true);
    } else {
      setIsOTPSent(false);
    }
  };

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/hospital/getdepartments`, {
      headers: { code: HOSPITAL_CODE }
    })
    .then(response => setDepartments(response.data.departments))
    .catch(error => console.error("Error fetching departments:", error));
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/doctor/register`, {
        name: formState.name,
        contact: formState.contact,
        email: email,
        password: formState.password,
        departmentId: formState.departmentId,
        gender: formState.gender,
        designation: formState.designation,
      }, {
        headers: { code: HOSPITAL_CODE }
      });
      localStorage.setItem("doctortoken", response.data.token);
      navigate("/doctordashboard");
    } catch (err) {
      window.alert(err);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Sign Up for Doctors</h1>
        <p className="text-muted-foreground">Enter your information to create a new account.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="John Doe" required value={formState.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={handleEmailChange} />
            <div className="flex gap-2">
              <Button type="button" className="w-full" onClick={handleSendOTP} disabled={isOTPSent}>
                {isOTPSent ? 'OTP Sent' : 'Send OTP'}
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input id="otp" placeholder="Enter OTP" required value={otp} onChange={handleOtpChange} />
            <Button type="button" className="w-full" onClick={handleVerifyOTP} disabled={isOTPVerified}>
              {isOTPVerified ? 'OTP Verified' : 'Verify OTP'}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact</Label>
            <Input id="contact" placeholder="123456789" required value={formState.contact} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  {formState.departmentId ? departments.find(dep => dep.id === formState.departmentId)?.name : 'Select Department'}
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {departments.map(department => (
                  <DropdownMenuItem key={department.id} onClick={() => handleDepartmentSelect(department.id)}>
                    {department.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  {formState.gender || 'Select Gender'}
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleGenderSelect('Male')}>Male</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenderSelect('Female')}>Female</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenderSelect('Other')}>Other</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  {formState.designation || 'Select Designation'}
                  <ChevronDownIcon className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleDesignationSelect('Trainee')}>Trainee</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDesignationSelect('Senior')}>Senior</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDesignationSelect('Head of Department')}>Head of Department</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDesignationSelect('Assistant')}>Assistant</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={formState.password} onChange={handleChange} />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={!isOTPVerified}>
          Sign Up
        </Button>
      </form>
    </div>
  );
}

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
