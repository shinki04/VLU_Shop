// import { Input } from "@heroui/react";

// import React from "react";
// import { EyeClosed, Eye } from "lucide-react";
// export default function CustomInputPass(
//   errorMessage,
//   label,
//   labelPlacement,
//   name,
//   placeholder,
//   value,
//   onChange
// ) {
//   const [isVisible, setIsVisible] = React.useState(false);

//   const toggleVisibility = () => setIsVisible(!isVisible);
//   const validatePassword = (value) =>
//     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);

//   return (
//     <Input
//             isRequired
//             color={
//               password === ""
//                 ? "default"
//                 : validatePassword(password)
//                 ? "default"
//                 : "danger"
//             }
//             isInvalid={password !== "" && !validatePassword(password)}
//             errorMessage="Please enter valid password"
//             label="Password"
//             labelPlacement="outside"
//             name="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             endContent={
//               <button
//                 aria-label="toggle password visibility"
//                 className="focus:outline-none"
//                 type="button"
//                 onClick={toggleVisibility}
//               >
//                 {isVisible ? (
// 					<EyeClosed size={16} strokeWidth={1.5} className="text-2xl text-default-400 pointer-events-none" />
//                 //   <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
//                 ) : (
//                 //   <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
// 				<Eye size={16} strokeWidth={1.5} className="text-2xl text-default-400 pointer-events-none" />
//                 )}
//               </button>
//             }
//             type={isVisible ? "text" : "password"}
//           />
//   );
// }
